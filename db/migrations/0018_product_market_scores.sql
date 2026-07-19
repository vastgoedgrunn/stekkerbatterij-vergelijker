-- =========================================================================
-- 0018_product_market_scores.sql
-- Externe marktscores (Bol/Amazon/Trustpilot e.d.), duidelijk gescheiden van
-- site-reviews. Geen neppe reviews: alleen geciteerde aggregates.
-- =========================================================================

do $$ begin
  create type market_score_scope as enum ('sku', 'brand');
exception
  when duplicate_object then null;
end $$;

alter table products
  add column if not exists market_score_average numeric(2,1)
    check (market_score_average is null or (market_score_average >= 0 and market_score_average <= 5)),
  add column if not exists market_score_count integer
    check (market_score_count is null or market_score_count >= 0),
  add column if not exists market_score_source_name text,
  add column if not exists market_score_source_url text,
  add column if not exists market_score_scope market_score_scope,
  add column if not exists market_score_checked_at timestamptz;

comment on column products.market_score_average is
  'Externe marktscore 0-5 (genormaliseerd). Niet site-reviews.';
comment on column products.market_score_count is
  'Aantal reviews achter de externe marktscore.';
comment on column products.market_score_source_name is
  'Bronlabel, bijv. Amazon.de of Trustpilot.';
comment on column products.market_score_source_url is
  'Citeerbare URL van de score.';
comment on column products.market_score_scope is
  'sku = productspecifiek; brand = merkniveau (duidelijk labelen in UI).';
comment on column products.market_score_checked_at is
  'Moment van verificatie van de externe score.';

create index if not exists products_market_score_average_idx
  on products (market_score_average desc nulls last)
  where deleted_at is null and status = 'published';
