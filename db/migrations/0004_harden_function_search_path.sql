-- =========================================================================
-- 0004_harden_function_search_path.sql
-- Zet expliciete search_path om function-search-path-injectie te voorkomen.
-- =========================================================================

alter function public.set_updated_at() set search_path = '';
alter function public.products_tsv() set search_path = '';
alter function public.log_price_change() set search_path = public, pg_catalog;
alter function public.refresh_product_rating_stats() set search_path = public, pg_catalog;
