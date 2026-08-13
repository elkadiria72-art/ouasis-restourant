'use server';

import { getSupabaseClient } from '@/lib/supabase';
import { defaultSettings, type RestaurantSettings } from '@/lib/settings-types';

export type { RestaurantSettings } from '@/lib/settings-types';

export async function fetchRestaurantSettings(): Promise<RestaurantSettings> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('restaurant_settings').select('*').eq('id', 'restaurant').maybeSingle();

  if (error) throw error;
  return (data || defaultSettings) as RestaurantSettings;
}

export async function saveRestaurantSettings(settings: RestaurantSettings): Promise<RestaurantSettings> {
  const supabase = getSupabaseClient();
  const payload = {
    ...settings,
    id: settings.id || 'restaurant',
  };

  const { data, error } = await supabase
    .from('restaurant_settings')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data as RestaurantSettings;
}
