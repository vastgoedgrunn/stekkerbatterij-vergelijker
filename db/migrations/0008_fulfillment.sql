-- =========================================================================
-- 0008_fulfillment.sql — Order-routing, goedkeuringswachtrij & track&trace
-- Betaalde orders krijgen een shipment-record; leverancier-e-mails en
-- track&trace gaan via approval_actions (niet auto-verstuurd).
-- =========================================================================

do $$ begin
  create type approval_action_kind as enum (
    'supplier_order_email',
    'shipment_tracking_email',
    'support_reply',
    'refund'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type approval_action_status as enum (
    'pending','approved','rejected','sent','cancelled'
  );
exception when duplicate_object then null; end $$;

create table if not exists approval_actions (
  id uuid primary key default gen_random_uuid(),
  kind approval_action_kind not null,
  status approval_action_status not null default 'pending',
  order_id uuid references orders(id) on delete cascade,
  shipment_id uuid references shipments(id) on delete set null,
  support_ticket_id uuid,
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  recipient_email text,
  email_subject text,
  email_body_html text,
  email_body_text text,
  requested_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  sent_at timestamptz,
  rejection_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists approval_actions_status_idx on approval_actions(status);
create index if not exists approval_actions_order_idx on approval_actions(order_id);

drop trigger if exists t_approval_actions_updated on approval_actions;
create trigger t_approval_actions_updated before update on approval_actions
  for each row execute function set_updated_at();

alter table approval_actions enable row level security;

drop policy if exists approval_actions_admin on approval_actions;
create policy approval_actions_admin on approval_actions for all
  using (has_role('admin') or has_role('editor'))
  with check (has_role('admin') or has_role('editor'));

-- merchant_manager mag commerce-orders lezen/updaten (fulfilment-voorbereiding).
drop policy if exists orders_merchant_manager on orders;
create policy orders_merchant_manager on orders for select
  using (has_role('merchant_manager'));

drop policy if exists shipments_merchant_manager on shipments;
create policy shipments_merchant_manager on shipments for select
  using (has_role('merchant_manager'));

drop policy if exists order_lines_merchant_manager on order_lines;
create policy order_lines_merchant_manager on order_lines for select
  using (has_role('merchant_manager'));

drop policy if exists payments_merchant_manager on payments;
create policy payments_merchant_manager on payments for select
  using (has_role('merchant_manager'));
