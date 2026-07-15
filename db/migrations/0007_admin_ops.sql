-- =========================================================================
-- 0007_admin_ops.sql — Admin/ops laag (fase 3)
-- 1) merchant_manager RLS-policies voor catalogus-/commerce-beheer
--    (consistent met 0003_rls.sql; admin/editor hadden al toegang).
-- 2) change_requests: reviewwachtrij voor door agents voorgestelde wijzigingen
--    (prijzen/feiten/content). Approve/reject door admin; append-only historie.
-- Schrijven in de admin-UI gebeurt via de service-role client (RLS omzeild) met
-- expliciete rolcheck in de server-actie; deze policies zijn defense-in-depth.
-- =========================================================================

-- ---------------------------------------------------------------------------
-- 1) merchant_manager mag catalogus + commerce beheren
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['products','merchants','offers','suppliers']
  loop
    execute format('drop policy if exists %1$s_merchant_manager on %1$s;', t);
    execute format(
      'create policy %1$s_merchant_manager on %1$s for all
       using (has_role(''merchant_manager''))
       with check (has_role(''merchant_manager''));', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 2) change_requests — reviewwachtrij voor agent-voorstellen
-- ---------------------------------------------------------------------------
do $$ begin
  create type change_request_status as enum ('pending','approved','rejected','applied');
exception when duplicate_object then null; end $$;

create table if not exists change_requests (
  id uuid primary key default gen_random_uuid(),
  kind text not null,                       -- bv. 'offer_price','product_update','content','fact','other'
  target_table text,
  target_id uuid,
  summary text not null,
  proposed jsonb not null default '{}'::jsonb,
  source text not null default 'agent',     -- welke afdeling/agent het voorstelde
  source_url text,                          -- bron-URL (verplicht voor prijs/feit, zie price-fact-verification)
  status change_request_status not null default 'pending',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists change_requests_status_idx on change_requests(status);
create index if not exists change_requests_target_idx on change_requests(target_table, target_id);

drop trigger if exists t_change_requests_updated on change_requests;
create trigger t_change_requests_updated before update on change_requests
  for each row execute function set_updated_at();

alter table change_requests enable row level security;

-- Beheer: admin/editor/merchant_manager mogen de wachtrij lezen en beoordelen.
drop policy if exists change_requests_admin on change_requests;
create policy change_requests_admin on change_requests for all
  using (has_role('admin') or has_role('editor') or has_role('merchant_manager'))
  with check (has_role('admin') or has_role('editor') or has_role('merchant_manager'));
