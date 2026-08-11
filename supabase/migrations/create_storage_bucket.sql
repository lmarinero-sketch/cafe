-- Create website-images bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('website-images', 'website-images', true)
on conflict (id) do nothing;

-- Policies for website-images (Assuming they don't exist yet)
drop policy if exists "Public Access to Website Images" on storage.objects;
create policy "Public Access to Website Images"
  on storage.objects for select
  using ( bucket_id = 'website-images' );

drop policy if exists "Allow authenticated uploads to Website Images" on storage.objects;
create policy "Allow authenticated uploads to Website Images"
  on storage.objects for insert
  with check ( bucket_id = 'website-images' );

drop policy if exists "Allow authenticated updates to Website Images" on storage.objects;
create policy "Allow authenticated updates to Website Images"
  on storage.objects for update
  using ( bucket_id = 'website-images' );

drop policy if exists "Allow authenticated deletes to Website Images" on storage.objects;
create policy "Allow authenticated deletes to Website Images"
  on storage.objects for delete
  using ( bucket_id = 'website-images' );
