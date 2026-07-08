'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

type MenuItemPayload = {
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
};

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

export async function addMenuItem(payload: MenuItemPayload) {
  const supabase = getSupabase();
  const { error } = await supabase.from('menu_items').insert(payload);
  revalidatePath('/admin');
  return { error };
}

export async function updateMenuItem(id: number, payload: MenuItemPayload) {
  const supabase = getSupabase();
  const { error } = await supabase.from('menu_items').update(payload).eq('id', id);
  revalidatePath('/admin');
  return { error };
}

export async function deleteMenuItem(id: number) {
  const supabase = getSupabase();
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  revalidatePath('/admin');
  return { error };
}
