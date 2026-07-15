-- =========================================================================
-- 0010_monetization.sql — Revenue engine: affiliate metadata, leads, energie
-- =========================================================================

do $$ begin
  create type commission_type as enum ('cps', 'cpa');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_status as enum ('new', 'approved', 'sent', 'converted', 'rejected');
exception when duplicate_object then null; end $$;

-- Merchants: netwerk-config voor deeplink-sjablonen
alter table merchants add column if not exists default_affiliate_network text;
alter table merchants add column if not exists network_publisher_id text;
alter table merchants add column if not exists deeplink_param_template jsonb default '{}'::jsonb;

-- Offers: commissie + product-deeplink
alter table offers add column if not exists commission_type commission_type;
alter table offers add column if not exists commission_rate numeric(6,4);
alter table offers add column if not exists commission_cents_fixed bigint
  check (commission_cents_fixed is null or commission_cents_fixed >= 0);
alter table offers add column if not exists affiliate_deeplink text;
alter table offers add column if not exists last_commission_verified_at timestamptz;
alter table offers add column if not exists commission_source_url text;

-- Products: per-product checkout (dropship heroes)
alter table products add column if not exists sellable boolean not null default false;

-- offer_clicks: click_ref voor netwerk-reconciliatie
alter table offer_clicks add column if not exists click_ref uuid default gen_random_uuid();
create unique index if not exists offer_clicks_click_ref_idx on offer_clicks(click_ref);

-- Partnerprogramma's (centrale bron voor Data-agent)
create table if not exists partner_programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  network text not null,
  program_id text,
  commission_type commission_type not null default 'cps',
  commission_rate numeric(6,4),
  commission_cents_min bigint,
  commission_cents_max bigint,
  cookie_days int,
  signup_url text,
  notes text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Energie-partners (Daisycon e.d.)
create table if not exists energy_partners (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  affiliate_url text not null,
  affiliate_network text,
  affiliate_params jsonb default '{}'::jsonb,
  commission_type commission_type not null default 'cpa',
  commission_cents_min bigint,
  commission_cents_max bigint,
  commission_source_url text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Leads (vaste thuisbatterij / installateur)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'wizard',
  customer_name text,
  customer_email text not null,
  phone text,
  postal_code text,
  qualification jsonb not null default '{}'::jsonb,
  status lead_status not null default 'new',
  partner_slug text,
  estimated_commission_cents bigint,
  notes text,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists leads_status_idx on leads(status);
create index if not exists leads_created_idx on leads(created_at desc);

-- energy_clicks (aparte logging naast offer_clicks)
create table if not exists energy_clicks (
  id uuid primary key default gen_random_uuid(),
  energy_partner_id uuid not null references energy_partners(id) on delete cascade,
  click_ref uuid not null default gen_random_uuid() unique,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['partner_programs','energy_partners','leads','energy_clicks']
  loop
    execute format('drop trigger if exists t_%1$s_updated on %1$s;', t);
    execute format(
      'create trigger t_%1$s_updated before update on %1$s
       for each row execute function set_updated_at();', t);
    execute format('alter table %I enable row level security;', t);
  end loop;
end $$;

drop policy if exists partner_programs_admin on partner_programs;
create policy partner_programs_admin on partner_programs for all
  using (has_role('admin') or has_role('editor') or has_role('merchant_manager'))
  with check (has_role('admin') or has_role('editor') or has_role('merchant_manager'));

drop policy if exists energy_partners_admin on energy_partners;
create policy energy_partners_admin on energy_partners for all
  using (has_role('admin') or has_role('editor'))
  with check (has_role('admin') or has_role('editor'));

drop policy if exists energy_partners_public_read on energy_partners;
create policy energy_partners_public_read on energy_partners for select
  using (active = true);

drop policy if exists leads_admin on leads;
create policy leads_admin on leads for all
  using (has_role('admin') or has_role('editor'))
  with check (has_role('admin') or has_role('editor'));

drop policy if exists energy_clicks_admin on energy_clicks;
create policy energy_clicks_admin on energy_clicks for select
  using (has_role('admin') or has_role('editor'));
