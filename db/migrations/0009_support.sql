-- =========================================================================
-- 0009_support.sql — Klantenservice-scaffold (fase 3)
-- Support-tickets + concept-antwoorden; live inbound wacht op e-mailintegratie.
-- Refunds gaan via approval_actions (kind = refund).
-- =========================================================================

do $$ begin
  create type support_ticket_status as enum ('open','awaiting_reply','resolved','closed');
exception when duplicate_object then null; end $$;

create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete set null,
  customer_email text not null,
  subject text not null,
  body text not null,
  status support_ticket_status not null default 'open',
  source text not null default 'manual',
  external_message_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists support_tickets_status_idx on support_tickets(status);
create index if not exists support_tickets_order_idx on support_tickets(order_id);

create table if not exists support_replies (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  draft_body text not null,
  approval_action_id uuid references approval_actions(id) on delete set null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists support_replies_ticket_idx on support_replies(ticket_id);

alter table approval_actions
  drop constraint if exists approval_actions_support_ticket_fkey;
alter table approval_actions
  add constraint approval_actions_support_ticket_fkey
  foreign key (support_ticket_id) references support_tickets(id) on delete set null;

drop trigger if exists t_support_tickets_updated on support_tickets;
create trigger t_support_tickets_updated before update on support_tickets
  for each row execute function set_updated_at();

alter table support_tickets enable row level security;
alter table support_replies enable row level security;

drop policy if exists support_tickets_admin on support_tickets;
create policy support_tickets_admin on support_tickets for all
  using (has_role('admin') or has_role('editor'))
  with check (has_role('admin') or has_role('editor'));

drop policy if exists support_replies_admin on support_replies;
create policy support_replies_admin on support_replies for all
  using (has_role('admin') or has_role('editor'))
  with check (has_role('admin') or has_role('editor'));
