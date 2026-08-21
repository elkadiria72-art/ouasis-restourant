'use server';

import { getSupabaseClient } from '@/lib/supabase';

export interface AdminNotification {
  id: string;
  message: string;
  time: string;
  created_at: string;
}

export async function fetchAdminNotifications(): Promise<AdminNotification[]> {
  const supabase = getSupabaseClient();

  const [ordersRes, requestsRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, table_number, created_at, status')
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('waiter_calls')
      .select('id, table_number, created_at, status')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  if (ordersRes.error) throw ordersRes.error;
  if (requestsRes.error) throw requestsRes.error;

  const items: AdminNotification[] = [
    ...(ordersRes.data || []).map((o) => ({
      id: `order-${o.id}`,
      message: `طلب جديد #${o.id} — الطاولة ${o.table_number}`,
      time: o.created_at || '',
      created_at: o.created_at || '',
    })),
    ...(requestsRes.data || []).map((r) => ({
      id: `waiter-${r.id}`,
      message: `نداء نادل — الطاولة ${r.table_number}`,
      time: r.created_at || '',
      created_at: r.created_at || '',
    })),
  ];

  return items
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);
}
