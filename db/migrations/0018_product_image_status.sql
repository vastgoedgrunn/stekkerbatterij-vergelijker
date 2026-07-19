-- =========================================================================
-- 0018_product_image_status.sql
-- Image OS: status + bronmetadata. UI en publish vertrouwen op image_status=ok,
-- niet alleen op een (mogelijk 404) image_path.
-- =========================================================================

do $$ begin
  create type product_image_status as enum ('ok', 'pending', 'rejected', 'broken');
exception
  when duplicate_object then null;
end $$;

alter table products
  add column if not exists image_status product_image_status not null default 'pending',
  add column if not exists image_source_url text,
  add column if not exists image_checked_at timestamptz,
  add column if not exists image_reject_reason text,
  add column if not exists image_content_hash text;

comment on column products.image_status is
  'Image OS: ok = toonbare packshot; pending/rejected/broken = placeholder in UI.';
comment on column products.image_source_url is
  'Bron-URL van de goedgekeurde of laatst geprobeerde productfoto.';
comment on column products.image_checked_at is
  'Laatste Image OS-check (heuristics/vision/existence).';
comment on column products.image_reject_reason is
  'Waarom image_status niet ok is (voor agent-digest).';
comment on column products.image_content_hash is
  'SHA-256 van image-bytes; voorkomt gedeelde foto tussen SKUs.';

-- Bestaande paden: plug-in met lokale asset → pending tot repair; vaste met
-- ontbrekende files markeren we broken zodat de repair-runner ze oppikt.
update products
set image_status = 'broken',
    image_reject_reason = 'Lokale image_path zonder bestand (Image OS bootstrap)',
    image_checked_at = now()
where product_type = 'fixed'
  and image_path is not null
  and image_path like '/images/products/%'
  and deleted_at is null;

-- Plug-in assets in /public bestaan; markeer ok tot Image OS force-repair.
update products
set image_status = 'ok',
    image_reject_reason = null,
    image_source_url = coalesce(image_source_url, 'local:' || image_path),
    image_checked_at = now()
where product_type = 'plug_in'
  and image_path like '/images/products/%'
  and deleted_at is null;

create index if not exists products_image_status_idx
  on products (image_status)
  where deleted_at is null;
