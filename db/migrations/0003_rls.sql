-- =========================================================================
-- 0003_rls.sql — Row Level Security (deny-by-default)
-- =========================================================================

-- Zet RLS aan op alle tabellen
do $$
declare t text;
begin
  foreach t in array array[
    'user_roles','brands','categories','products','product_categories',
    'spec_definitions','product_specs','merchants','offers','price_history',
    'reviews','favorites','price_alerts','content_articles','content_links',
    'faqs','business_settings','audit_log'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Publieke leestoegang (catalogus & content)
-- ---------------------------------------------------------------------------
drop policy if exists brands_read on brands;
create policy brands_read on brands for select using (deleted_at is null);

drop policy if exists categories_read on categories;
create policy categories_read on categories for select using (deleted_at is null);

drop policy if exists products_read on products;
create policy products_read on products for select
  using (status = 'published' and deleted_at is null);

drop policy if exists product_categories_read on product_categories;
create policy product_categories_read on product_categories for select using (true);

drop policy if exists spec_definitions_read on spec_definitions;
create policy spec_definitions_read on spec_definitions for select using (true);

drop policy if exists product_specs_read on product_specs;
create policy product_specs_read on product_specs for select using (true);

drop policy if exists merchants_read on merchants;
create policy merchants_read on merchants for select using (deleted_at is null);

drop policy if exists offers_read on offers;
create policy offers_read on offers for select using (deleted_at is null);

drop policy if exists price_history_read on price_history;
create policy price_history_read on price_history for select using (true);

drop policy if exists content_read on content_articles;
create policy content_read on content_articles for select
  using (status = 'published' and deleted_at is null);

drop policy if exists content_links_read on content_links;
create policy content_links_read on content_links for select using (true);

drop policy if exists faqs_read on faqs;
create policy faqs_read on faqs for select using (published = true);

drop policy if exists business_settings_read on business_settings;
create policy business_settings_read on business_settings for select using (true);

-- ---------------------------------------------------------------------------
-- Beheer (editor/admin) — volledige toegang op catalogus & content
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'brands','categories','products','product_categories','spec_definitions',
    'product_specs','merchants','offers','content_articles','content_links',
    'faqs','business_settings'
  ]
  loop
    execute format('drop policy if exists %1$s_admin on %1$s;', t);
    execute format(
      'create policy %1$s_admin on %1$s for all
       using (has_role(''admin'') or has_role(''editor''))
       with check (has_role(''admin'') or has_role(''editor''));', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Reviews: publiek ziet approved; eigenaar beheert eigen; moderators modereren
-- ---------------------------------------------------------------------------
drop policy if exists reviews_public_read on reviews;
create policy reviews_public_read on reviews for select
  using (status = 'approved' and deleted_at is null);

drop policy if exists reviews_owner_read on reviews;
create policy reviews_owner_read on reviews for select
  using (user_id = auth.uid());

drop policy if exists reviews_owner_insert on reviews;
create policy reviews_owner_insert on reviews for insert
  with check (user_id = auth.uid());

drop policy if exists reviews_owner_update on reviews;
create policy reviews_owner_update on reviews for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists reviews_moderate on reviews;
create policy reviews_moderate on reviews for update
  using (has_role('moderator') or has_role('admin'))
  with check (has_role('moderator') or has_role('admin'));

-- ---------------------------------------------------------------------------
-- Favorieten & prijsalerts: strikt eigenaar
-- ---------------------------------------------------------------------------
drop policy if exists favorites_owner on favorites;
create policy favorites_owner on favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists alerts_owner on price_alerts;
create policy alerts_owner on price_alerts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Rollen & audit: alleen admin
-- ---------------------------------------------------------------------------
drop policy if exists user_roles_self_read on user_roles;
create policy user_roles_self_read on user_roles for select
  using (user_id = auth.uid() or has_role('admin'));

drop policy if exists user_roles_admin on user_roles;
create policy user_roles_admin on user_roles for all
  using (has_role('admin')) with check (has_role('admin'));

drop policy if exists audit_admin_read on audit_log;
create policy audit_admin_read on audit_log for select using (has_role('admin'));

-- Matview met geaggregeerde (niet-gevoelige) reviewscores toegankelijk maken
grant select on product_rating_stats to anon, authenticated;
