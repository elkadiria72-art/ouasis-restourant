'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const getSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

// Shared source of truth with ouasis-menu / ouasis-staff: the `waiter_calls` table.
// Its live schema is (id, table_id, table_number, message, status, created_at), so
// admin-side fields (request_type, accepted_at, resolved_at) are derived/omitted here
// instead of stored.
export interface AdminWaiterRequest {
  id: number;
  table_number: number;
  request_type: 'waiter' | 'bill' | 'issue' | 'other';
  message: string;
  status: 'new' | 'accepted' | 'resolved';
  created_at: string;
}

type WaiterCallRow = {
  id: number;
  table_number: number | string | null;
  message: string | null;
  status: string | null;
  created_at: string | null;
};

const BILL_KEYWORDS = ['حساب', 'bill', 'addition', 'nonce'];

function deriveRequestType(message: string): AdminWaiterRequest['request_type'] {
  const normalized = message.toLowerCase();
  return BILL_KEYWORDS.some((k) => normalized.includes(k)) ? 'bill' : 'waiter';
}

function mapStatus(status: string | null): AdminWaiterRequest['status'] {
  switch (status) {
    case 'acknowledged':
      return 'accepted';
    case 'completed':
    case 'resolved':
      return 'resolved';
    case 'accepted':
      return 'accepted';
    default:
      return 'new';
  }
}

function toAdminRequest(row: WaiterCallRow): AdminWaiterRequest {
  const message = row.message || '';
  return {
    id: row.id,
    table_number: Number(row.table_number) || 0,
    request_type: deriveRequestType(message),
    message,
    status: mapStatus(row.status),
    created_at: row.created_at || new Date().toISOString(),
  };
}

const DB_STATUS_BY_FILTER: Record<string, string[]> = {
  new: ['pending'],
  accepted: ['accepted', 'acknowledged'],
  resolved: ['completed', 'resolved'],
};

export async function fetchWaiterRequests(status?: string): Promise<AdminWaiterRequest[]> {
  const supabase = getSupabase();
  let query = supabase.from('waiter_calls').select('id, table_number, message, status, created_at');

  if (status && DB_STATUS_BY_FILTER[status]) {
    query = query.in('status', DB_STATUS_BY_FILTER[status]);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(toAdminRequest);
}

export async function fetchRequestDetails(requestId: number): Promise<AdminWaiterRequest | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('waiter_calls')
    .select('id, table_number, message, status, created_at')
    .eq('id', requestId)
    .single();

  if (error) throw error;
  return data ? toAdminRequest(data as WaiterCallRow) : null;
}

// 'accepted' is stored as 'acknowledged' (what the customer Menu's realtime handler
// treats as "waiter is on the way"); 'resolved' is stored as 'completed' (what the
// Staff app writes), keeping a single status vocabulary in waiter_calls.
const DB_STATUS_BY_ADMIN_STATUS: Record<string, string> = {
  accepted: 'acknowledged',
  resolved: 'completed',
};

export async function updateRequestStatus(requestId: number, status: string) {
  const supabase = getSupabase();
  const dbStatus = DB_STATUS_BY_ADMIN_STATUS[status];
  if (!dbStatus) {
    throw new Error(`Unsupported waiter request status: ${status}`);
  }

  const { error } = await supabase.from('waiter_calls').update({ status: dbStatus }).eq('id', requestId);

  revalidatePath('/admin/waiter-requests');
  if (error) throw error;
}

export async function acknowledgeRequest(requestId: number) {
  await updateRequestStatus(requestId, 'accepted');
}

export async function resolveRequest(requestId: number) {
  await updateRequestStatus(requestId, 'resolved');
}

export async function deleteRequest(requestId: number) {
  const supabase = getSupabase();
  const { error } = await supabase.from('waiter_calls').delete().eq('id', requestId);

  revalidatePath('/admin/waiter-requests');
  if (error) throw error;
}
