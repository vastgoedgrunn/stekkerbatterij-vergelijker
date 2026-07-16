-- =========================================================================
-- 0016_product_type.sql — plug_in vs fixed thuisbatterijen + lead attributie
-- =========================================================================

do $$ begin
  create type product_type as enum ('plug_in', 'fixed');
exception when duplicate_object then null; end $$;

alter table products add column if not exists product_type product_type not null default 'plug_in';
alter table products add column if not exists indicative_price_min_cents bigint
  check (indicative_price_min_cents is null or indicative_price_min_cents >= 0);
alter table products add column if not exists indicative_price_max_cents bigint
  check (
    indicative_price_max_cents is null
    or (
      indicative_price_max_cents >= 0
      and (
        indicative_price_min_cents is null
        or indicative_price_max_cents >= indicative_price_min_cents
      )
    )
  );

create index if not exists products_product_type_idx on products(product_type);

alter table leads add column if not exists product_id uuid references products(id) on delete set null;
create index if not exists leads_product_id_idx on leads(product_id);
