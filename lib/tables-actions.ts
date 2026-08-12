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

export async function fetchTables() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .order('table_number', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchTableDetails(tableId: number) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('tables')
    .select('*, orders(*)')
    .eq('id', tableId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateTableStatus(tableId: number, status: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from('tables').update({ status }).eq('id', tableId);
  revalidatePath('/admin/tables');
  if (error) throw error;
}

export async function clearTable(tableId: number) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('tables')
    .update({ status: 'empty', waiter_call: false })
    .eq('id', tableId);
  revalidatePath('/admin/tables');
  if (error) throw error;
}

export async function acknowledgeWaiterCall(tableId: number) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('tables')
    .update({ waiter_call: false })
    .eq('id', tableId);
  revalidatePath('/admin/tables');
  if (error) throw error;
}
