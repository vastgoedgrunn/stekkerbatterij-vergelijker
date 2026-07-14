-- =========================================================================
-- 0001_init.sql — Kernschema Stekkerbatterij Vergelijker
-- UUID PK's, geld in centen (bigint), soft delete, audit-velden.
-- =========================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------------------
-- RBAC
-- ---------------------------------------------------------------------------
do $$ begin
  create type app_role as enum ('user','editor','merchant_manager','moderator','admin');
exception when duplicate_object then null; end $$;

create table if not exists user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role    app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- ---------------------------------------------------------------------------
-- Merken & categorieën
-- ---------------------------------------------------------------------------
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_path text,
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Producten
-- ---------------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete restrict,
  name text not null,
  slug text not null unique,
  summary text,
  description text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  capacity_kwh numeric(6,2) check (capacity_kwh >= 0),
  power_kw numeric(6,2) check (power_kw >= 0),
  cycles int check (cycles >= 0),
  warranty_years int check (warranty_years >= 0),
  expandable boolean not null default false,
  image_path text,
  search_tsv tsvector,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists products_brand_idx on products(brand_id);
create index if not exists products_status_idx on products(status) where deleted_at is null;
create index if not exists products_capacity_idx on products(capacity_kwh);
create index if not exists products_search_idx on products using gin(search_tsv);
create index if not exists products_name_trgm on products using gin(name gin_trgm_ops);

create table if not exists product_categories (
  product_id uuid not null references products(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (product_id, category_id)
);

-- Spec-definities (lookup) + waarden
create table if not exists spec_definitions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  unit text,
  data_type text not null check (data_type in ('number','text','boolean')),
  sort_order int not null default 0
);

create table if not exists product_specs (
  product_id uuid not null references products(id) on delete cascade,
  spec_id uuid not null references spec_definitions(id) on delete restrict,
  value_number numeric,
  value_text text,
  value_boolean boolean,
  primary key (product_id, spec_id)
);

-- ---------------------------------------------------------------------------
-- Aanbieders, offers, prijshistorie
-- ---------------------------------------------------------------------------
create table if not exists merchants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_self boolean not null default false,
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  merchant_id uuid not null references merchants(id) on delete restrict,
  price_cents bigint not null check (price_cents >= 0),
  currency char(3) not null default 'EUR',
  stock_status text not null default 'unknown'
    check (stock_status in ('in_stock','out_of_stock','preorder','unknown')),
  delivery_days int,
  affiliate_url text,
  is_sponsored boolean not null default false,
  last_checked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (product_id, merchant_id)
);
create index if not exists offers_product_idx on offers(product_id) where deleted_at is null;
create index if not exists offers_price_idx on offers(price_cents);

create table if not exists price_history (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references offers(id) on delete cascade,
  price_cents bigint not null check (price_cents >= 0),
  recorded_at timestamptz not null default now()
);
create index if not exists price_history_offer_time_idx on price_history(offer_id, recorded_at desc);

-- ---------------------------------------------------------------------------
-- Reviews, favorieten, prijsalerts
-- ---------------------------------------------------------------------------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  title text,
  body text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (product_id, user_id)
);
create index if not exists reviews_product_approved_idx
  on reviews(product_id) where status = 'approved' and deleted_at is null;

create table if not exists favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  threshold_cents bigint not null check (threshold_cents > 0),
  active boolean not null default true,
  last_triggered_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ---------------------------------------------------------------------------
-- Content / CMS
-- ---------------------------------------------------------------------------
create table if not exists content_articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  body jsonb not null default '[]'::jsonb,
  cover_image_path text,
  status text not null default 'draft' check (status in ('draft','in_review','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists content_status_idx on content_articles(status) where deleted_at is null;

create table if not exists content_links (
  article_id uuid not null references content_articles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  check (product_id is not null or category_id is not null)
);

create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  product_id uuid references products(id) on delete cascade,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Configuratie & audit
-- ---------------------------------------------------------------------------
create table if not exists business_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  diff jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_entity_idx on audit_log(entity, entity_id);
