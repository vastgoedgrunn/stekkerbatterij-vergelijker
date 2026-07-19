-- Server-side logging voor lead-affiliate redirects (e-WNDR parity met offer_clicks).
create table if not exists lead_affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  partner text not null,
  product_slug text,
  click_ref uuid not null default gen_random_uuid(),
  destination_url text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists lead_affiliate_clicks_click_ref_idx
  on lead_affiliate_clicks (click_ref);
create index if not exists lead_affiliate_clicks_created_idx
  on lead_affiliate_clicks (created_at desc);

alter table lead_affiliate_clicks enable row level security;

drop policy if exists lead_affiliate_clicks_admin on lead_affiliate_clicks;
create policy lead_affiliate_clicks_admin on lead_affiliate_clicks
  for select
  using (has_role('admin'));
