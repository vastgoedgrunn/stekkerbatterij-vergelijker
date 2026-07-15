-- =========================================================================
-- 0013_catalog_discovery.sql — Catalog Discovery Engine queues
-- =========================================================================

do $$ begin
  create type catalog_candidate_status as enum (
    'discovered',
    'matched',
    'needs_review',
    'upserted',
    'published',
    'rejected'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type catalog_candidate_source as enum (
    'bol',
    'merchant',
    'research',
    'manual'
  );
exception when duplicate_object then null; end $$;

create table if not exists catalog_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  trigger_source text not null default 'automation',
  stats jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists catalog_candidates (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references catalog_runs(id) on delete set null,
  source catalog_candidate_source not null default 'research',
  external_id text,
  brand_slug text,
  raw_title text not null,
  raw_description text,
  capacity_kwh numeric(8,3),
  power_kw numeric(8,3),
  url text not null,
  image_url text,
  price_cents bigint,
  currency char(3) not null default 'EUR',
  match_score numeric(4,3),
  match_notes text,
  status catalog_candidate_status not null default 'discovered',
  product_id uuid references products(id) on delete set null,
  offer_id uuid references offers(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists catalog_candidates_source_external_uidx
  on catalog_candidates (source, external_id)
  where external_id is not null and deleted_at is null;

create index if not exists catalog_candidates_status_idx
  on catalog_candidates (status)
  where deleted_at is null;

create index if not exists catalog_candidates_brand_idx
  on catalog_candidates (brand_slug)
  where deleted_at is null;

alter table catalog_runs enable row level security;
alter table catalog_candidates enable row level security;

drop policy if exists catalog_runs_admin on catalog_runs;
create policy catalog_runs_admin on catalog_runs for all
  using (has_role('admin') or has_role('editor'))
  with check (has_role('admin') or has_role('editor'));

drop policy if exists catalog_candidates_admin on catalog_candidates;
create policy catalog_candidates_admin on catalog_candidates for all
  using (has_role('admin') or has_role('editor'))
  with check (has_role('admin') or has_role('editor'));

comment on table catalog_candidates is
  'Discovery queue: merchant/research SKUs before products/offers upsert + SKU-match gate';
