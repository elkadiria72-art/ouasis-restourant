-- Public bucket for menu item images (run in Supabase SQL editor if not created yet)
-- Dashboard: Storage → New bucket → name: menu-images → Public bucket

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = true;

-- Allow public read + anon upload (adjust RLS for production as needed)
create policy "menu-images public read"
on storage.objects for select
using (bucket_id = 'menu-images');

create policy "menu-images anon upload"
on storage.objects for insert
with check (bucket_id = 'menu-images');

create policy "menu-images anon update"
on storage.objects for update
using (bucket_id = 'menu-images');
