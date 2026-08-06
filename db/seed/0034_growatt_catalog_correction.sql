-- Growatt-catalogus gecorrigeerd en aangevuld op 2026-08-06T06:04:31Z.
--
-- De fabrikant en actuele Nederlandse handel tonen NOAH 2000 en NEXA 2000 als
-- afzonderlijke modellen. Voor "NOAH 2000S" is geen harde SKU-bron gevonden.
-- Daarom blijft die rij draft en vervangt NEXA 2000 de tweede gepubliceerde SKU.
--
-- Fabrikant:
-- https://nl.growatt.com/products
-- NEXA 2000, prijs, voorraad, SKU 229066 en MPN NEXA 2000:
-- https://www.stralendgroen.nl/product/growatt-nexa-2000/
-- NOAH 2000, prijs en voorraad:
-- https://uwsolarinstallatieshop.nl/Thuisbatterijen/580-growatt-noah-2000.html

update products
set
  status = 'draft',
  published_at = null,
  updated_at = now()
where slug = 'growatt-noah-2000s'
  and deleted_at is null;

update offers o
set
  deleted_at = coalesce(o.deleted_at, '2026-08-06T06:04:31Z'::timestamptz),
  affiliate_link_status = 'broken',
  affiliate_link_note = 'P0: geen harde bron voor SKU NOAH 2000S; offer soft-deleted 2026-08-06',
  affiliate_link_checked_at = '2026-08-06T06:04:31Z'::timestamptz,
  last_checked_at = '2026-08-06T06:04:31Z'::timestamptz,
  updated_at = now()
from products p
where o.product_id = p.id
  and p.slug = 'growatt-noah-2000s';

insert into products (
  brand_id, name, slug, summary, description, status, product_type,
  capacity_kwh, power_kw, cycles, warranty_years, expandable, image_path, published_at
)
select
  b.id,
  'Growatt NEXA 2000',
  'growatt-nexa-2000',
  'Alles-in-één stekkerbatterij met vier MPPT-ingangen en uitbreidbare opslag.',
  'De Growatt NEXA 2000 combineert een LiFePO4-batterij van 2,048 kWh met een geïntegreerde omvormer. Het systeem levert 800 watt via het stopcontact en is uitbreidbaar tot 8,192 kWh.',
  'published',
  'plug_in',
  2.048,
  0.8,
  6000,
  10,
  true,
  '/images/products/growatt-nexa-2000.png',
  '2026-08-06T06:04:31Z'::timestamptz
from brands b
where b.slug = 'growatt'
  and b.deleted_at is null
on conflict (slug) do update set
  name = excluded.name,
  summary = excluded.summary,
  description = excluded.description,
  status = excluded.status,
  product_type = excluded.product_type,
  capacity_kwh = excluded.capacity_kwh,
  power_kw = excluded.power_kw,
  cycles = excluded.cycles,
  warranty_years = excluded.warranty_years,
  expandable = excluded.expandable,
  image_path = excluded.image_path,
  published_at = coalesce(products.published_at, excluded.published_at),
  deleted_at = null,
  updated_at = now();

insert into product_categories (product_id, category_id)
select p.id, c.id
from products p
join categories c on c.slug in ('stekkerbatterijen', 'uitbreidbaar', 'dynamisch-contract')
where p.slug = 'growatt-nexa-2000'
on conflict do nothing;

insert into merchants (name, slug, is_self, website_url)
values (
  'Stralendgroen',
  'stralendgroen',
  false,
  'https://www.stralendgroen.nl'
)
on conflict (slug) do update set
  name = excluded.name,
  website_url = excluded.website_url,
  deleted_at = null,
  updated_at = now();

insert into merchants (name, slug, is_self, website_url)
values (
  'Uw Solar Installatie Shop',
  'uw-solar-installatie-shop',
  false,
  'https://uwsolarinstallatieshop.nl'
)
on conflict (slug) do update set
  name = excluded.name,
  website_url = excluded.website_url,
  deleted_at = null,
  updated_at = now();

insert into offers (
  product_id, merchant_id, price_cents, currency, stock_status, delivery_days,
  affiliate_url, affiliate_network, affiliate_link_status, affiliate_link_note,
  is_sponsored, affiliate_link_checked_at, last_checked_at
)
select
  p.id,
  m.id,
  54500,
  'EUR',
  'in_stock',
  2,
  'https://www.stralendgroen.nl/product/growatt-nexa-2000/',
  null,
  'ok',
  'Exacte NEXA 2000 productpagina, SKU 229066, EUR 545 inclusief btw; affiliate deeplink ontbreekt, plak deeplink zodra netwerk open is; gecheckt 2026-08-06T06:04:31Z',
  false,
  '2026-08-06T06:04:31Z'::timestamptz,
  '2026-08-06T06:04:31Z'::timestamptz
from products p
cross join merchants m
where p.slug = 'growatt-nexa-2000'
  and m.slug = 'stralendgroen'
on conflict (product_id, merchant_id) do update set
  price_cents = excluded.price_cents,
  stock_status = excluded.stock_status,
  delivery_days = excluded.delivery_days,
  affiliate_url = excluded.affiliate_url,
  affiliate_network = excluded.affiliate_network,
  affiliate_link_status = excluded.affiliate_link_status,
  affiliate_link_note = excluded.affiliate_link_note,
  affiliate_link_checked_at = excluded.affiliate_link_checked_at,
  last_checked_at = excluded.last_checked_at,
  deleted_at = null,
  updated_at = now();

insert into offers (
  product_id, merchant_id, price_cents, currency, stock_status, delivery_days,
  affiliate_url, affiliate_network, affiliate_link_status, affiliate_link_note,
  is_sponsored, affiliate_link_checked_at, last_checked_at
)
select
  p.id,
  m.id,
  60379,
  'EUR',
  'in_stock',
  4,
  'https://uwsolarinstallatieshop.nl/Thuisbatterijen/580-growatt-noah-2000.html',
  null,
  'ok',
  'Exacte NOAH 2000 productpagina, artikel O-G-NOAH-2000, EUR 603,79 inclusief btw; affiliate deeplink ontbreekt, plak deeplink zodra netwerk open is; gecheckt 2026-08-06T06:04:31Z',
  false,
  '2026-08-06T06:04:31Z'::timestamptz,
  '2026-08-06T06:04:31Z'::timestamptz
from products p
cross join merchants m
where p.slug = 'growatt-noah-2000'
  and m.slug = 'uw-solar-installatie-shop'
on conflict (product_id, merchant_id) do update set
  price_cents = excluded.price_cents,
  stock_status = excluded.stock_status,
  delivery_days = excluded.delivery_days,
  affiliate_url = excluded.affiliate_url,
  affiliate_network = excluded.affiliate_network,
  affiliate_link_status = excluded.affiliate_link_status,
  affiliate_link_note = excluded.affiliate_link_note,
  affiliate_link_checked_at = excluded.affiliate_link_checked_at,
  last_checked_at = excluded.last_checked_at,
  deleted_at = null,
  updated_at = now();
