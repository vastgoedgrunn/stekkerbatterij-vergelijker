-- =========================================================================
-- 0002_functions_triggers.sql — functies, triggers, materialized view
-- =========================================================================

-- updated_at automatisch bijwerken
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'brands','categories','products','merchants','offers','reviews',
    'content_articles','faqs'
  ]
  loop
    execute format('drop trigger if exists t_%1$s_updated on %1$s;', t);
    execute format(
      'create trigger t_%1$s_updated before update on %1$s
       for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- Full-text search voor producten (Nederlands)
create or replace function products_tsv() returns trigger
language plpgsql as $$
begin
  new.search_tsv := to_tsvector('dutch',
    coalesce(new.name,'') || ' ' || coalesce(new.summary,'') || ' ' || coalesce(new.description,''));
  return new;
end $$;

drop trigger if exists t_products_tsv on products;
create trigger t_products_tsv before insert or update on products
  for each row execute function products_tsv();

-- Prijshistorie automatisch loggen bij prijswijziging
create or replace function log_price_change() returns trigger
language plpgsql as $$
begin
  if (tg_op = 'INSERT') or (new.price_cents is distinct from old.price_cents) then
    insert into price_history(offer_id, price_cents) values (new.id, new.price_cents);
  end if;
  return new;
end $$;

drop trigger if exists t_offers_price on offers;
create trigger t_offers_price after insert or update of price_cents on offers
  for each row execute function log_price_change();

-- RBAC helper (security definer zodat RLS-policies user_roles kunnen lezen)
create or replace function has_role(r app_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from user_roles
    where user_id = auth.uid() and role = r
  );
$$;

-- Aggregatie reviewscores als materialized view (voorkomt drift)
drop materialized view if exists product_rating_stats;
create materialized view product_rating_stats as
  select product_id,
         round(avg(rating)::numeric, 2) as avg_rating,
         count(*)::int as review_count
  from reviews
  where status = 'approved' and deleted_at is null
  group by product_id;
create unique index if not exists product_rating_stats_pk on product_rating_stats(product_id);

create or replace function refresh_product_rating_stats() returns void
language sql as $$
  refresh materialized view concurrently product_rating_stats;
$$;
