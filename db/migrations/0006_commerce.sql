-- =========================================================================
-- 0006_commerce.sql — Eigen webshop (fase 2), dropship-backed via Mollie
-- Nieuwe tabellen: suppliers, addresses, orders, order_lines, payments,
-- shipments. Commerce-kolommen op products. Geld in centen (bigint),
-- btw-uitsplitsing, sequentiële order-/factuurnummers. RLS deny-by-default,
-- consistent met 0003_rls.sql (eigenaar leest eigen; admin/editor volledig;
-- schrijven via de service-role client die RLS omzeilt).
-- =========================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type order_status as enum
    ('pending','paid','failed','cancelled','refunded','shipped');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum
    ('open','pending','authorized','paid','failed','canceled','expired','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type shipment_status as enum
    ('pending','label_created','shipped','delivered','cancelled');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Sequences voor mensvriendelijke, sequentiële order- en factuurnummers
-- ---------------------------------------------------------------------------
create sequence if not exists order_number_seq start 10001;
create sequence if not exists invoice_number_seq start 20001;

-- ---------------------------------------------------------------------------
-- Dropship-leveranciers
-- ---------------------------------------------------------------------------
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  contact_email text,
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Commerce-kolommen op products (verkoopbaar = supplier_id gezet)
-- ---------------------------------------------------------------------------
alter table products add column if not exists sku text;
alter table products add column if not exists ean text;
alter table products add column if not exists cost_cents bigint check (cost_cents is null or cost_cents >= 0);
alter table products add column if not exists supplier_id uuid references suppliers(id) on delete set null;
alter table products add column if not exists handling_days int not null default 0 check (handling_days >= 0);
alter table products add column if not exists weight_grams int check (weight_grams is null or weight_grams >= 0);
create index if not exists products_supplier_idx on products(supplier_id) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- Adressen (verzend-/factuuradres). Gast-checkout: user_id nullable.
-- ---------------------------------------------------------------------------
create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  company text,
  line1 text not null,
  line2 text,
  postal_code text not null,
  city text not null,
  country char(2) not null default 'NL',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists addresses_user_idx on addresses(user_id);

-- ---------------------------------------------------------------------------
-- Orders. Bedragen in centen + valuta, btw-uitsplitsing, statusenum.
-- user_id nullable (gast-checkout). Factuurnummer pas bij betaling.
-- ---------------------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint not null unique default nextval('order_number_seq'),
  invoice_number bigint unique,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  status order_status not null default 'pending',
  currency char(3) not null default 'EUR',
  vat_rate numeric(5,4) not null,
  subtotal_cents bigint not null check (subtotal_cents >= 0),   -- excl. btw
  vat_cents bigint not null check (vat_cents >= 0),
  total_cents bigint not null check (total_cents >= 0),         -- incl. btw
  shipping_address_id uuid references addresses(id) on delete set null,
  billing_address_id uuid references addresses(id) on delete set null,
  notes text,
  placed_at timestamptz not null default now(),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_user_idx on orders(user_id);
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_email_idx on orders(email);

-- ---------------------------------------------------------------------------
-- Orderregels (snapshot van naam/prijs op moment van bestellen).
-- unit_price_cents en line_total_cents zijn inclusief btw.
-- ---------------------------------------------------------------------------
create table if not exists order_lines (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  offer_id uuid references offers(id) on delete set null,
  sku text,
  name text not null,
  quantity int not null check (quantity > 0),
  unit_price_cents bigint not null check (unit_price_cents >= 0),
  vat_rate numeric(5,4) not null,
  line_total_cents bigint not null check (line_total_cents >= 0),
  created_at timestamptz not null default now()
);
create index if not exists order_lines_order_idx on order_lines(order_id);

-- ---------------------------------------------------------------------------
-- Betalingen (Mollie). We bewaren het Mollie payment-id en her-bevragen
-- de status via de API in de webhook (geen vertrouwen op payload-inhoud).
-- ---------------------------------------------------------------------------
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  provider text not null default 'mollie',
  provider_payment_id text unique,
  status payment_status not null default 'open',
  amount_cents bigint not null check (amount_cents >= 0),
  currency char(3) not null default 'EUR',
  method text,
  checkout_url text,
  paid_at timestamptz,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists payments_order_idx on payments(order_id);
create index if not exists payments_provider_idx on payments(provider_payment_id);

-- ---------------------------------------------------------------------------
-- Verzendingen (fase 3 track & trace; nu voorbereid).
-- ---------------------------------------------------------------------------
create table if not exists shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  supplier_id uuid references suppliers(id) on delete set null,
  status shipment_status not null default 'pending',
  carrier text,
  tracking_code text,
  tracking_url text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists shipments_order_idx on shipments(order_id);

-- ---------------------------------------------------------------------------
-- updated_at-triggers (herbruikt set_updated_at uit 0002)
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['suppliers','addresses','orders','payments','shipments']
  loop
    execute format('drop trigger if exists t_%1$s_updated on %1$s;', t);
    execute format(
      'create trigger t_%1$s_updated before update on %1$s
       for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Sequentieel factuurnummer (alleen server-side / service-role).
-- security definer met vaste search_path (consistent met 0004).
-- ---------------------------------------------------------------------------
create or replace function next_invoice_number() returns bigint
language sql security definer set search_path = public, pg_catalog as $$
  select nextval('invoice_number_seq');
$$;
revoke all on function next_invoice_number() from public;
revoke all on function next_invoice_number() from anon;
revoke all on function next_invoice_number() from authenticated;

-- =========================================================================
-- RLS — deny-by-default. Geen anon/authenticated schrijfrechten:
-- orders/lines/payments/shipments worden uitsluitend server-side via de
-- service-role client aangemaakt/gewijzigd. Eigenaar mag eigen data lezen;
-- admin/editor volledig beheer. Consistent met 0003_rls.sql.
-- =========================================================================
do $$
declare t text;
begin
  foreach t in array array['suppliers','addresses','orders','order_lines','payments','shipments']
  loop
    execute format('alter table %I enable row level security;', t);
  end loop;
end $$;

-- Suppliers: intern (admin/editor). Geen publieke toegang.
drop policy if exists suppliers_admin on suppliers;
create policy suppliers_admin on suppliers for all
  using (has_role('admin') or has_role('editor'))
  with check (has_role('admin') or has_role('editor'));

-- Addresses: eigenaar beheert eigen; admin/editor volledig. Gastadressen
-- (user_id null) zijn niet leesbaar via RLS — alleen via service-role.
drop policy if exists addresses_owner on addresses;
create policy addresses_owner on addresses for all
  using (user_id is not null and user_id = auth.uid())
  with check (user_id is not null and user_id = auth.uid());

drop policy if exists addresses_admin on addresses;
create policy addresses_admin on addresses for all
  using (has_role('admin') or has_role('editor'))
  with check (has_role('admin') or has_role('editor'));

-- Orders: eigenaar leest eigen; admin/editor volledig. Schrijven via service-role.
drop policy if exists orders_owner_read on orders;
create policy orders_owner_read on orders for select
  using (user_id is not null and user_id = auth.uid());

drop policy if exists orders_admin on orders;
create policy orders_admin on orders for all
  using (has_role('admin') or has_role('editor'))
  with check (has_role('admin') or has_role('editor'));

-- Order_lines: eigenaar leest via de order; admin/editor volledig.
drop policy if exists order_lines_owner_read on order_lines;
create policy order_lines_owner_read on order_lines for select
  using (exists (
    select 1 from orders o
    where o.id = order_lines.order_id
      and o.user_id is not null and o.user_id = auth.uid()
  ));

drop policy if exists order_lines_admin on order_lines;
create policy order_lines_admin on order_lines for all
  using (has_role('admin') or has_role('editor'))
  with check (has_role('admin') or has_role('editor'));

-- Payments: eigenaar leest via de order; admin/editor volledig. Schrijven via service-role.
drop policy if exists payments_owner_read on payments;
create policy payments_owner_read on payments for select
  using (exists (
    select 1 from orders o
    where o.id = payments.order_id
      and o.user_id is not null and o.user_id = auth.uid()
  ));

drop policy if exists payments_admin on payments;
create policy payments_admin on payments for all
  using (has_role('admin') or has_role('editor'))
  with check (has_role('admin') or has_role('editor'));

-- Shipments: eigenaar leest via de order; admin/editor volledig.
drop policy if exists shipments_owner_read on shipments;
create policy shipments_owner_read on shipments for select
  using (exists (
    select 1 from orders o
    where o.id = shipments.order_id
      and o.user_id is not null and o.user_id = auth.uid()
  ));

drop policy if exists shipments_admin on shipments;
create policy shipments_admin on shipments for all
  using (has_role('admin') or has_role('editor'))
  with check (has_role('admin') or has_role('editor'));
