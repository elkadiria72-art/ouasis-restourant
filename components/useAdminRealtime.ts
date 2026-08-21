'use client';

import { useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

// One shared channel for the whole admin app: every postgres_changes event for the
// tables below fans out to the registered (debounced) callbacks. Pages keep their
// slow polling intervals only as an offline/missed-event fallback.

export type AdminRealtimeHandlers = {
  onOrdersChange?: () => void;
  onWaiterCallsChange?: () => void;
  onMenuItemsChange?: () => void;
  onCategoriesChange?: () => void;
  onTablesChange?: () => void;
};

const DEBOUNCE_MS = 300;

function debounce(fn: () => void, waitMs: number): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(fn, waitMs);
  };
}

export function useAdminRealtime(handlers: AdminRealtimeHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const supabase = getSupabaseClient();

    const events: Array<[string, () => void]> = [
      ['orders', () => handlersRef.current.onOrdersChange?.()],
      ['waiter_calls', () => handlersRef.current.onWaiterCallsChange?.()],
      ['menu_items', () => handlersRef.current.onMenuItemsChange?.()],
      ['categories', () => handlersRef.current.onCategoriesChange?.()],
      ['tables', () => handlersRef.current.onTablesChange?.()],
    ];

    let channel = supabase.channel('admin-realtime');
    const callsChannel = supabase.channel('admin-realtime-calls');
    const debounced = new Map(events.map(([table, fn]) => [table, debounce(fn, DEBOUNCE_MS)]));

    // Separate channels per logical feature: a subscription the database cannot
    // serve (e.g. a table missing from the realtime publication) must not stop
    // delivery on the other channel.
    const attach = (ch: ReturnType<typeof supabase.channel>, tables: string[]) => {
      for (const table of tables) {
        ch.on('postgres_changes', { event: '*', schema: 'public', table }, () => debounced.get(table)?.());
      }
      return ch;
    };

    const onDataTables = ['orders', 'menu_items', 'categories', 'tables'];
    let hadError = false;
    attach(channel, onDataTables).subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        hadError = true;
      } else if (status === 'SUBSCRIBED' && hadError) {
        // Connection came back after a failure: refresh whatever the pages show so
        // events missed while offline are recovered through a normal data fetch.
        hadError = false;
        for (const table of onDataTables) debounced.get(table)?.();
      }
    });

    let hadCallsError = false;
    attach(callsChannel, ['waiter_calls']).subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        hadCallsError = true;
      } else if (status === 'SUBSCRIBED' && hadCallsError) {
        hadCallsError = false;
        debounced.get('waiter_calls')?.();
      }
    });

    return () => {
      void supabase.removeChannel(channel);
      void supabase.removeChannel(callsChannel);
    };
  }, []);
}
