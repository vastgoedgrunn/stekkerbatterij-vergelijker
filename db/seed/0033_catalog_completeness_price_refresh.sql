-- Catalogusaanvulling en prijsrefresh.
-- Gecontroleerd: 2026-07-30T06:04:00Z.
--
-- Prijsbronnen:
-- Anker Max AC: https://www.bol.com/nl/nl/p/anker-solix-solarbank-max-ac-balkonkrachtwerk-met-opslag-7kwh-3600w-alles-in-1-plug-play-thuisaccu-10000-cycli-5-min-installatie-zonnepaneel-met-omvormer/9300000292343906/
-- Anker E1600 Pro: https://www.bol.com/nl/nl/p/anker-solix-solarbank-2-e1600-pro/9300000185730379/
-- EcoFlow STREAM AC Pro: https://nl.ecoflow.com/products/stream-ac-pro-ac
-- Zendure SolarFlow 800 + AB2000L: https://www.zendure.nl/products/solarflow-800
-- Marstek Venus E 3.0: https://www.bol.com/nl/nl/p/marstek-venus-e-3-0-5-12kwh-plug-play-thuisbatterij-via-230v-stopcontact/9300000240523865/
-- Growatt NOAH 2000: https://www.wallboxdiscounter.com/nl/growatt-noah-2000-thuisbatterij.html
-- HomeWizard Plug-In Battery: https://www.homewizard.com/nl/plug-in-battery/
-- Sessy 5 kWh: https://www.sessy.nl/product/sessy/
-- Sunology VAULT: https://sunology.eu/products/vault-batterie-solaire-maison
-- Sunology STOREY Extension: https://sunology.eu/products/extension-storey
--
-- De Anker prijs daalt van EUR 2199 naar EUR 2099 (4,5%).
-- De Nederlandse Zendure setprijs blijft EUR 747. Prijswijzigingen en nieuwe offers worden
-- automatisch append-only gelogd door trigger t_offers_price.

update offers o
set
  price_cents = 209900,
  stock_status = 'in_stock',
  affiliate_link_note = 'Bol productpagina EAN 0194644338664, EUR 2099, gecheckt 2026-07-30T06:04:00Z',
  affiliate_link_checked_at = '2026-07-30T06:04:00Z'::timestamptz,
  last_checked_at = '2026-07-30T06:04:00Z'::timestamptz,
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'anker-solix-solarbank-max-ac'
  and m.slug = 'bol'
  and o.deleted_at is null;

update products
set indicative_price_min_cents = 209900, updated_at = now()
where slug = 'anker-solix-solarbank-max-ac'
  and deleted_at is null;

update offers o
set
  price_cents = 79900,
  stock_status = 'in_stock',
  affiliate_url = 'https://nl.ecoflow.com/products/stream-ac-pro-ac',
  affiliate_link_status = 'pending',
  affiliate_link_note = 'Officiele EcoFlow STREAM AC Pro productpagina, EUR 799; affiliate deeplink ontbreekt, gecheckt 2026-07-30T06:04:00Z',
  affiliate_link_checked_at = '2026-07-30T06:04:00Z'::timestamptz,
  last_checked_at = '2026-07-30T06:04:00Z'::timestamptz,
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'ecoflow-stream-ac-pro'
  and m.slug = 'ecoflow'
  and o.deleted_at is null;

update offers o
set
  price_cents = 74700,
  stock_status = 'in_stock',
  affiliate_link_note = 'Daisycon deeplink naar SolarFlow 800; Nederlandse setprijs EUR 747, gecheckt 2026-07-30T06:04:00Z',
  affiliate_link_checked_at = '2026-07-30T06:04:00Z'::timestamptz,
  last_checked_at = '2026-07-30T06:04:00Z'::timestamptz,
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'zendure-solarflow-800'
  and m.slug = 'zendure'
  and o.deleted_at is null;

update offers o
set
  price_cents = 69900,
  stock_status = 'in_stock',
  affiliate_link_note = 'Bol productpagina voor Anker SOLIX Solarbank 2 E1600 Pro, EUR 699; gecheckt 2026-07-30T06:04:00Z',
  affiliate_link_checked_at = '2026-07-30T06:04:00Z'::timestamptz,
  last_checked_at = '2026-07-30T06:04:00Z'::timestamptz,
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'anker-solix-solarbank-2-e1600-pro'
  and m.slug = 'bol'
  and o.deleted_at is null;

update offers o
set
  price_cents = 130000,
  stock_status = 'in_stock',
  affiliate_link_note = 'Bol productpagina voor Marstek Venus E 3.0, EUR 1300; gecheckt 2026-07-30T06:04:00Z',
  affiliate_link_checked_at = '2026-07-30T06:04:00Z'::timestamptz,
  last_checked_at = '2026-07-30T06:04:00Z'::timestamptz,
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'marstek-venus-512'
  and m.slug = 'bol'
  and o.deleted_at is null;

update offers o
set
  price_cents = case
    when p.slug = 'homewizard-plug-in-battery-bundle' then 239000
    else 119500
  end,
  stock_status = 'in_stock',
  affiliate_link_note = case
    when p.slug = 'homewizard-plug-in-battery-bundle'
      then 'HomeWizard merkshop, twee batterijen van EUR 1195; gecheckt 2026-07-30T06:04:00Z'
    else 'HomeWizard merkshop, EUR 1195; gecheckt 2026-07-30T06:04:00Z'
  end,
  affiliate_link_checked_at = '2026-07-30T06:04:00Z'::timestamptz,
  last_checked_at = '2026-07-30T06:04:00Z'::timestamptz,
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug in ('homewizard-plug-in-battery', 'homewizard-plug-in-battery-bundle')
  and m.slug = 'homewizard'
  and o.deleted_at is null;

update offers o
set
  price_cents = 355000,
  stock_status = 'in_stock',
  affiliate_link_note = 'Sessy merkshop, 5 kWh EUR 3550; affiliate deeplink ontbreekt, gecheckt 2026-07-30T06:04:00Z',
  affiliate_link_checked_at = '2026-07-30T06:04:00Z'::timestamptz,
  last_checked_at = '2026-07-30T06:04:00Z'::timestamptz,
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'sessy-thuisbatterij'
  and m.slug = 'sessy'
  and o.deleted_at is null;

update offers o
set
  affiliate_link_note = 'Bestaande Duo is twee gekoppelde Sessy-units. De merkshop toont een 10 kWh-configuratie voor EUR 5500 zonder harde configuratiematch; prijs niet gewijzigd, affiliate deeplink ontbreekt, gecheckt 2026-07-30T06:04:00Z',
  affiliate_link_checked_at = '2026-07-30T06:04:00Z'::timestamptz,
  last_checked_at = '2026-07-30T06:04:00Z'::timestamptz,
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'sessy-thuisbatterij-duo'
  and m.slug = 'sessy'
  and o.deleted_at is null;

insert into merchants (
  name, slug, is_self, website_url, default_affiliate_network
) values (
  'Wallbox Discounter',
  'wallbox-discounter',
  false,
  'https://www.wallboxdiscounter.com',
  null
)
on conflict (slug) do update set
  name = excluded.name,
  website_url = excluded.website_url,
  updated_at = now();

insert into offers (
  product_id, merchant_id, price_cents, currency, stock_status, delivery_days,
  is_sponsored, affiliate_url, affiliate_deeplink, affiliate_network,
  affiliate_link_status, affiliate_link_note, affiliate_link_checked_at, last_checked_at
)
select
  p.id,
  m.id,
  74900,
  'EUR',
  'in_stock',
  2,
  false,
  'https://www.wallboxdiscounter.com/nl/growatt-noah-2000-thuisbatterij.html',
  null,
  null,
  'ok',
  'Exacte Growatt NOAH 2000 productpagina, direct en onbetaald; affiliate deeplink ontbreekt, gecheckt 2026-07-30T06:04:00Z',
  '2026-07-30T06:04:00Z'::timestamptz,
  '2026-07-30T06:04:00Z'::timestamptz
from products p
cross join merchants m
where p.slug = 'growatt-noah-2000'
  and m.slug = 'wallbox-discounter'
  and p.deleted_at is null
on conflict (product_id, merchant_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  stock_status = excluded.stock_status,
  delivery_days = excluded.delivery_days,
  affiliate_url = excluded.affiliate_url,
  affiliate_deeplink = null,
  affiliate_network = null,
  affiliate_link_status = excluded.affiliate_link_status,
  affiliate_link_note = excluded.affiliate_link_note,
  affiliate_link_checked_at = excluded.affiliate_link_checked_at,
  last_checked_at = excluded.last_checked_at,
  deleted_at = null,
  updated_at = now();

insert into products (
  brand_id, name, slug, summary, description, status, product_type,
  capacity_kwh, power_kw, cycles, warranty_years, expandable, image_path,
  ean, indicative_price_min_cents, published_at
)
select
  b.id,
  'Sunology STOREY Extension',
  'sunology-storey-extension',
  'Uitbreidingsmodule voor STOREY Master met 2,2 kWh extra opslag en 500 W extra vermogen.',
  'Sunology STOREY Extension werkt uitsluitend met een STOREY Master. Een module voegt 2,2 kWh opslag en 500 W vermogen toe. Per Master zijn maximaal drie uitbreidingsmodules mogelijk.',
  'published',
  'accessory'::product_type,
  2.2,
  0.5,
  7500,
  15,
  true,
  '/images/products/sunology-storey-extension.png',
  '3760417690177',
  119000,
  now()
from brands b
where b.slug = 'sunology'
on conflict (slug) do update set
  brand_id = excluded.brand_id,
  name = excluded.name,
  summary = excluded.summary,
  description = excluded.description,
  status = 'published',
  product_type = 'accessory',
  capacity_kwh = excluded.capacity_kwh,
  power_kw = excluded.power_kw,
  cycles = excluded.cycles,
  warranty_years = excluded.warranty_years,
  expandable = excluded.expandable,
  image_path = excluded.image_path,
  ean = excluded.ean,
  indicative_price_min_cents = excluded.indicative_price_min_cents,
  published_at = coalesce(products.published_at, now()),
  deleted_at = null,
  updated_at = now();

insert into product_categories (product_id, category_id)
select p.id, c.id
from products p
cross join categories c
where p.slug = 'sunology-storey-extension'
  and c.slug = 'energie-accessoires'
on conflict do nothing;

insert into offers (
  product_id, merchant_id, price_cents, currency, stock_status, delivery_days,
  is_sponsored, affiliate_url, affiliate_deeplink, affiliate_network,
  affiliate_link_status, affiliate_link_note, affiliate_link_checked_at, last_checked_at
)
select
  p.id,
  m.id,
  119000,
  'EUR',
  'in_stock',
  10,
  false,
  'https://sunology.eu/products/extension-storey',
  null,
  null,
  'ok',
  'Sunology SKU STOREYEC2200P500, direct en onbetaald; affiliate deeplink ontbreekt, gecheckt 2026-07-30T06:04:00Z',
  '2026-07-30T06:04:00Z'::timestamptz,
  '2026-07-30T06:04:00Z'::timestamptz
from products p
cross join merchants m
where p.slug = 'sunology-storey-extension'
  and m.slug = 'sunology'
  and p.deleted_at is null
on conflict (product_id, merchant_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  stock_status = excluded.stock_status,
  affiliate_url = excluded.affiliate_url,
  affiliate_deeplink = null,
  affiliate_network = null,
  affiliate_link_status = excluded.affiliate_link_status,
  affiliate_link_note = excluded.affiliate_link_note,
  affiliate_link_checked_at = excluded.affiliate_link_checked_at,
  last_checked_at = excluded.last_checked_at,
  deleted_at = null,
  updated_at = now();

insert into products (
  brand_id, name, slug, summary, description, status, product_type,
  capacity_kwh, power_kw, cycles, warranty_years, expandable, image_path,
  indicative_price_min_cents, published_at
)
select
  b.id,
  'Sunology VAULT',
  'sunology-vault',
  'Draagbare batterij van 700 Wh die via een Sunology PLAY Max ook het huishouden kan voeden.',
  'Sunology VAULT is een draagbare batterij van 700 Wh. In combinatie met een Sunology PLAY Max slaat VAULT zonnestroom op en levert de batterij via de stekker van het zonnestation energie aan het huishouden.',
  'published',
  'plug_in'::product_type,
  0.7,
  null,
  2500,
  10,
  false,
  '/images/products/sunology-vault.png',
  42900,
  now()
from brands b
where b.slug = 'sunology'
on conflict (slug) do update set
  brand_id = excluded.brand_id,
  name = excluded.name,
  summary = excluded.summary,
  description = excluded.description,
  status = 'published',
  product_type = 'plug_in',
  capacity_kwh = excluded.capacity_kwh,
  power_kw = excluded.power_kw,
  cycles = excluded.cycles,
  warranty_years = excluded.warranty_years,
  expandable = excluded.expandable,
  image_path = excluded.image_path,
  indicative_price_min_cents = excluded.indicative_price_min_cents,
  published_at = coalesce(products.published_at, now()),
  deleted_at = null,
  updated_at = now();

insert into product_categories (product_id, category_id)
select p.id, c.id
from products p
cross join categories c
where p.slug = 'sunology-vault'
  and c.slug = 'balkonbatterijen'
on conflict do nothing;

insert into product_specs (product_id, spec_id, value_number, value_boolean, value_text)
select p.id, sd.id, v.value_number, v.value_boolean, v.value_text
from (values
  ('ip_rating', null::numeric, null::boolean, 'IP65'),
  ('chemistry', null::numeric, null::boolean, 'Lithium-ion'),
  ('weight_kg', 3.7::numeric, null::boolean, null::text),
  ('installation', null::numeric, null::boolean, 'Via Sunology PLAY Max')
) as v(spec_key, value_number, value_boolean, value_text)
join products p on p.slug = 'sunology-vault'
join spec_definitions sd on sd.key = v.spec_key
on conflict (product_id, spec_id) do update set
  value_number = excluded.value_number,
  value_boolean = excluded.value_boolean,
  value_text = excluded.value_text;

insert into offers (
  product_id, merchant_id, price_cents, currency, stock_status, delivery_days,
  is_sponsored, affiliate_url, affiliate_deeplink, affiliate_network,
  affiliate_link_status, affiliate_link_note, affiliate_link_checked_at, last_checked_at
)
select
  p.id,
  m.id,
  42900,
  'EUR',
  'in_stock',
  null,
  false,
  'https://sunology.eu/products/vault-batterie-solaire-maison',
  null,
  null,
  'ok',
  'Officiele Sunology VAULT productpagina, EUR 429; affiliate deeplink ontbreekt, gecheckt 2026-07-30T06:04:00Z',
  '2026-07-30T06:04:00Z'::timestamptz,
  '2026-07-30T06:04:00Z'::timestamptz
from products p
cross join merchants m
where p.slug = 'sunology-vault'
  and m.slug = 'sunology'
  and p.deleted_at is null
on conflict (product_id, merchant_id) do update set
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  stock_status = excluded.stock_status,
  delivery_days = excluded.delivery_days,
  affiliate_url = excluded.affiliate_url,
  affiliate_deeplink = null,
  affiliate_network = null,
  affiliate_link_status = excluded.affiliate_link_status,
  affiliate_link_note = excluded.affiliate_link_note,
  affiliate_link_checked_at = excluded.affiliate_link_checked_at,
  last_checked_at = excluded.last_checked_at,
  deleted_at = null,
  updated_at = now();
