-- =========================================================================
-- 0005_affiliate_clicks.sql — Affiliate-omzetmotor (fase 1)
-- Append-only kliklog voor uitgaande aanbiederkliks + affiliate-tracking
-- velden op offers. RLS: geen publieke/anon toegang; inserts uitsluitend
-- server-side via de service-role client (deny-by-default).
-- =========================================================================

-- ---------------------------------------------------------------------------
-- Affiliate-tracking op offers (deep-link/UTM-parameters templatebaar)
-- ---------------------------------------------------------------------------
alter table offers add column if not exists affiliate_network text;
alter table offers add column if not exists affiliate_params jsonb;

-- ---------------------------------------------------------------------------
-- Kliklog (append-only). Wordt uitsluitend server-side gevuld.
-- ---------------------------------------------------------------------------
create table if not exists offer_clicks (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references offers(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  merchant_id uuid references merchants(id) on delete set null,
  referrer text,
  user_agent text,
  session_hash text,
  created_at timestamptz not null default now()
);
create index if not exists offer_clicks_offer_idx on offer_clicks(offer_id);
create index if not exists offer_clicks_created_idx on offer_clicks(created_at desc);

-- ---------------------------------------------------------------------------
-- RLS: deny-by-default. Geen anon/authenticated toegang; alleen de
-- service-role client (die RLS omzeilt) schrijft. Admin mag lezen voor
-- rapportage. Consistent met 0003_rls.sql.
-- ---------------------------------------------------------------------------
alter table offer_clicks enable row level security;

drop policy if exists offer_clicks_admin_read on offer_clicks;
create policy offer_clicks_admin_read on offer_clicks for select
  using (has_role('admin'));
