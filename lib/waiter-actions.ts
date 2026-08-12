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

export async function fetchWaiterRequests(status?: string) {
  const supabase = getSupabase();
  let query = supabase.from('waiter_requests').select('*');

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchRequestDetails(requestId: number) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('waiter_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateRequestStatus(requestId: number, status: string) {
  const supabase = getSupabase();
  const updateData: any = { status };

  if (status === 'resolved') {
    updateData.resolved_at = new Date().toISOString();
  } else if (status === 'accepted') {
    updateData.accepted_at = new Date().toISOString();
  }

  const { error } = await supabase.from('waiter_requests').update(updateData).eq('id', requestId);

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
  const { error } = await supabase.from('waiter_requests').delete().eq('id', requestId);

  revalidatePath('/admin/waiter-requests');
  if (error) throw error;
}
