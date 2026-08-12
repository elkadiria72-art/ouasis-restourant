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

export async function fetchOrders(filters?: { dateRange?: string; status?: string }) {
  const supabase = getSupabase();
  let query = supabase.from('orders').select('*');

  // Date range filter
  if (filters?.dateRange) {
    const now = new Date();
    let startDate = new Date();

    switch (filters.dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    query = query
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString());
  }

  // Status filter
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchOrderDetails(orderId: number) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateOrderStatus(orderId: number, status: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  revalidatePath('/admin/orders');
  if (error) throw error;
}

export async function cancelOrder(orderId: number) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId);
  revalidatePath('/admin/orders');
  if (error) throw error;
}
