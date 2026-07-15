-- Public product image bucket for ingested merchant/manufacturer photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'products',
  'products',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects for select
  to public
  using (bucket_id = 'products');

drop policy if exists "Authenticated upload product images" on storage.objects;
create policy "Authenticated upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'products');

drop policy if exists "Authenticated update product images" on storage.objects;
create policy "Authenticated update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'products');
