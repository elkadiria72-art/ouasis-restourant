-- Run in Supabase SQL Editor if columns are missing
ALTER TABLE restaurant_settings
  ADD COLUMN IF NOT EXISTS new_order_sound_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS waiter_call_sound_url text DEFAULT '';

-- Create public storage bucket (if not exists) via Dashboard or:
-- insert into storage.buckets (id, name, public) values ('restaurant-assets', 'restaurant-assets', true);
