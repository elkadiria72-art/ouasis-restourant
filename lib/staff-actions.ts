'use server';

import { getSupabaseClient } from '@/lib/supabase';

export type StaffRole = 'Waiter' | 'Kitchen' | 'Staff';
export type StaffStatus = 'online' | 'offline';

export interface StaffMember {
  id: number;
  name: string;
  role: StaffRole;
  status: StaffStatus;
  email?: string | null;
  is_active?: boolean;
  created_at?: string;
}

export async function fetchStaffMembers(): Promise<StaffMember[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('staff').select('*').order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as StaffMember[];
}

export async function addStaffMember(payload: { name: string; role: StaffRole; status?: StaffStatus; email?: string }) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('staff')
    .insert({
      name: payload.name,
      role: payload.role,
      status: payload.status || 'online',
      email: payload.email || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateStaffRole(id: number, role: StaffRole) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('staff').update({ role }).eq('id', id);

  if (error) throw error;
}

export async function updateStaffStatus(id: number, status: StaffStatus) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('staff').update({ status, is_active: status === 'online' }).eq('id', id);

  if (error) throw error;
}

export async function deactivateStaff(id: number) {
  return updateStaffStatus(id, 'offline');
}

export async function reactivateStaff(id: number) {
  return updateStaffStatus(id, 'online');
}
