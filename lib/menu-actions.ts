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

// ============ PRODUCTS ============

export async function fetchProducts() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('id', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function addProduct(payload: {
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from('menu_items').insert(payload);
  revalidatePath('/admin/menu/products');
  if (error) throw error;
}

export async function updateProduct(id: number, payload: any) {
  const supabase = getSupabase();
  const { error } = await supabase.from('menu_items').update(payload).eq('id', id);
  revalidatePath('/admin/menu/products');
  if (error) throw error;
}

export async function deleteProduct(id: number) {
  const supabase = getSupabase();
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  revalidatePath('/admin/menu/products');
  if (error) throw error;
}

export async function toggleProductAvailability(id: number, isAvailable: boolean) {
  const supabase = getSupabase();
  const { error } = await supabase.from('menu_items').update({ is_available: isAvailable }).eq('id', id);
  revalidatePath('/admin/menu/products');
  if (error) throw error;
}

// ============ CATEGORIES ============

export async function fetchCategories() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('order_index', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function addCategory(payload: { name: string; order_index: number }) {
  const supabase = getSupabase();
  const { error } = await supabase.from('categories').insert(payload);
  revalidatePath('/admin/menu/categories');
  if (error) throw error;
}

export async function updateCategory(id: number, payload: any) {
  const supabase = getSupabase();
  const { error } = await supabase.from('categories').update(payload).eq('id', id);
  revalidatePath('/admin/menu/categories');
  if (error) throw error;
}

export async function deleteCategory(id: number) {
  const supabase = getSupabase();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  revalidatePath('/admin/menu/categories');
  if (error) throw error;
}

export async function reorderCategories(categories: Array<{ id: number; order_index: number }>) {
  const supabase = getSupabase();
  
  for (const category of categories) {
    const { error } = await supabase
      .from('categories')
      .update({ order_index: category.order_index })
      .eq('id', category.id);
    
    if (error) throw error;
  }
  
  revalidatePath('/admin/menu/categories');
}
