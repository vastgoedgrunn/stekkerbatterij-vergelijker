-- Avondcontrole affiliate- en offergezondheid.
-- Gecontroleerd: 2026-07-29T18:13:24Z.
--
-- Outboundbronnen:
-- Bol partnerlinks: HTTPS 301 naar de exact gecodeerde product-URL en SKU.
-- Zendure: https://www.zendure.nl/products/solarflow-800?variant=47143119290623
-- HomeWizard: https://www.homewizard.com/nl/plug-in-battery/
-- Sessy: https://www.sessy.nl/product/sessy/
-- Sunology STOREY: https://sunology.eu/products/storey-batterie-stockage-plug-play
--
-- Prijsbronnen:
-- Marstek Venus:
-- https://www.bol.com/nl/nl/p/marstek-venus-e-3-0-5-12kwh-plug-play-thuisbatterij-via-230v-stopcontact/9300000240523865/
-- EcoFlow STREAM AC Pro:
-- https://www.bol.com/nl/nl/p/ecoflow-stream-ac-pro-thuisbatterij/9300000232241116/
-- Anker Solarbank Max AC:
-- https://www.bol.com/nl/nl/p/anker-solix-solarbank-max-ac-balkonkrachtwerk-met-opslag-7kwh-3600w-alles-in-1-plug-play-thuisaccu-10000-cycli-5-min-installatie-zonnepaneel-met-omvormer/9300000292343906/
-- Sunology STOREY:
-- https://sunology.eu/products/storey-batterie-stockage-plug-play
--
-- De offer-prijstrigger schrijft elke prijswijziging append-only naar price_history.

-- Leg de Zendure set vast op de geverifieerde Shopify-variant met AB2000L.
update offers o
set
  affiliate_url = 'https://www.zendure.nl/products/solarflow-800?variant=47143119290623',
  affiliate_deeplink = 'https://glp8.net/c/?si=20779&li=1881195&wi=423133&ws=&dl=products%2Fsolarflow-800%3Fvariant%3D47143119290623',
  updated_at = now()
where o.product_id = (select id from products where slug = 'zendure-solarflow-800')
  and o.merchant_id = (select id from merchants where slug = 'zendure')
  and o.deleted_at is null;

-- Alle verifieerbare actieve offers zijn opnieuw via HTTPS gecontroleerd.
update offers o
set
  affiliate_link_status = 'ok',
  affiliate_link_note = case
    when verified.merchant_slug = 'bol'
      then 'Avondcontrole 2026-07-29: Bol partnerlink 301 naar exacte HTTPS product-URL en SKU'
    when verified.merchant_slug in ('homewizard', 'zendure')
      then 'Avondcontrole 2026-07-29: Daisycon-link eindigt op HTTPS 200 en SKU-match'
    else 'Avondcontrole 2026-07-29: product-URL eindigt op HTTPS 200 en SKU-match'
  end,
  affiliate_link_checked_at = '2026-07-29T18:13:24Z'::timestamptz,
  updated_at = now()
from (
  select p.id as product_id, m.id as merchant_id, checks.merchant_slug
  from (
    values
      ('homewizard-energy-display', 'bol'),
      ('sessy-thuisbatterij', 'sessy'),
      ('p1-kabel-10m', 'bol'),
      ('p1-kabel-5m', 'bol'),
      ('anker-solix-solarbank-max-ac', 'bol'),
      ('anker-solix-bp3800', 'bol'),
      ('homewizard-p1-meter', 'bol'),
      ('ecoflow-stream-ac-pro', 'bol'),
      ('zendure-solarflow-800', 'zendure'),
      ('homewizard-p1-voeding', 'bol'),
      ('sunology-storey', 'sunology'),
      ('anker-solix-solarbank-2-e1600-pro', 'bol'),
      ('marstek-venus-512', 'bol'),
      ('homewizard-actieve-p1-splitter', 'bol'),
      ('anker-solix-power-dock', 'bol'),
      ('homewizard-plug-in-battery-bundle', 'homewizard'),
      ('zendure-ab3000x', 'bol'),
      ('homewizard-plug-in-battery', 'homewizard'),
      ('p1-kabel-3m', 'bol'),
      ('homewizard-energy-socket', 'bol'),
      ('anker-solix-bp2700', 'bol')
  ) as checks(product_slug, merchant_slug)
  join products p on p.slug = checks.product_slug
  join merchants m on m.slug = checks.merchant_slug
) as verified
where o.product_id = verified.product_id
  and o.merchant_id = verified.merchant_id
  and o.deleted_at is null;

-- PLAY is een zonnepaneelset zonder batterij-SKU. De Sessy Duo-offer landt
-- op de single-SKU zonder een specifieke Duo-configuratie.
update offers o
set
  stock_status = 'out_of_stock',
  affiliate_link_status = 'broken',
  affiliate_link_note = blocked.health_note,
  affiliate_link_checked_at = '2026-07-29T18:13:24Z'::timestamptz,
  last_checked_at = '2026-07-29T18:13:24Z'::timestamptz,
  deleted_at = coalesce(o.deleted_at, now()),
  updated_at = now()
from (
  select p.id as product_id, m.id as merchant_id, targets.health_note
  from (
    values
      (
        'sunology-play',
        'sunology',
        'P0: URL verkoopt een PLAY zonnepaneelset zonder batterij-SKU; soft-deleted 2026-07-29'
      ),
      (
        'sessy-thuisbatterij-duo',
        'sessy',
        'P0: URL heeft geen specifieke Duo-SKU of Duo-prijs; soft-deleted 2026-07-29'
      )
  ) as targets(product_slug, merchant_slug, health_note)
  join products p on p.slug = targets.product_slug
  join merchants m on m.slug = targets.merchant_slug
) as blocked
where o.product_id = blocked.product_id
  and o.merchant_id = blocked.merchant_id;

update products
set
  status = 'draft',
  published_at = null,
  updated_at = now()
where slug = 'sunology-play'
  and deleted_at is null;

-- Broken offers bij niet-gepubliceerde producten mogen niet actief blijven.
update offers o
set
  deleted_at = coalesce(o.deleted_at, now()),
  affiliate_link_note = coalesce(
    o.affiliate_link_note,
    'P0: broken offer bij niet-gepubliceerd product soft-deleted 2026-07-29'
  ),
  affiliate_link_checked_at = '2026-07-29T18:13:24Z'::timestamptz,
  updated_at = now()
from products p
where o.product_id = p.id
  and p.status <> 'published'
  and o.affiliate_link_status = 'broken'
  and o.deleted_at is null;

-- EcoFlow heeft nu een exacte product-URL. De offer blijft pending en zonder
-- outbound CTA totdat een echte Awin publisherdeeplink beschikbaar is.
update offers o
set
  affiliate_url = 'https://nl.ecoflow.com/products/stream-ac-pro-ac',
  affiliate_link_status = 'pending',
  affiliate_link_note = 'P0: exacte EcoFlow product-URL HTTPS 200; AWIN_PUBLISHER_ID en publisherdeeplink ontbreken',
  affiliate_link_checked_at = '2026-07-29T18:13:24Z'::timestamptz,
  last_checked_at = '2026-07-29T18:13:24Z'::timestamptz,
  updated_at = now()
where o.product_id = (select id from products where slug = 'ecoflow-stream-ac-pro')
  and o.merchant_id = (select id from merchants where slug = 'ecoflow')
  and o.deleted_at is null;

-- STOREY brongegevens corrigeren tegelijk met de geverifieerde prijs.
update products
set
  name = 'Sunology STOREY',
  summary = 'Uitbreidbare plug-in batterij met 2,2 kWh opslag en 500 W vermogen per module.',
  description = 'Sunology STOREY slaat zonnestroom of voordelige netstroom op en levert die later terug. Het Master Pack heeft 2,2 kWh capaciteit en is uitbreidbaar met extra modules.',
  capacity_kwh = 2.2,
  power_kw = 0.5,
  cycles = 7500,
  warranty_years = 15,
  expandable = true,
  indicative_price_min_cents = 139000,
  updated_at = now()
where slug = 'sunology-storey'
  and deleted_at is null;

update product_specs ps
set value_number = 500
where ps.product_id = (select id from products where slug = 'sunology-storey')
  and ps.spec_id = (select id from spec_definitions where key = 'inverter_w');

update product_specs ps
set value_number = 30.5
where ps.product_id = (select id from products where slug = 'sunology-storey')
  and ps.spec_id = (select id from spec_definitions where key = 'weight_kg');

update product_specs ps
set value_text = 'IP64'
where ps.product_id = (select id from products where slug = 'sunology-storey')
  and ps.spec_id = (select id from spec_definitions where key = 'ip_rating');

-- Topklik-prijzen met SKU-specifieke bronnen.
update offers o
set
  price_cents = prices.price_cents,
  stock_status = 'in_stock',
  affiliate_link_note = prices.health_note,
  affiliate_link_checked_at = '2026-07-29T18:13:24Z'::timestamptz,
  last_checked_at = '2026-07-29T18:13:24Z'::timestamptz,
  updated_at = now()
from (
  select
    p.id as product_id,
    m.id as merchant_id,
    targets.price_cents,
    targets.health_note
  from (
    values
      (
        'marstek-venus-512',
        'bol',
        138500::bigint,
        'Bol productbron EUR 1385 en partnerlink SKU-match; gecheckt 2026-07-29'
      ),
      (
        'ecoflow-stream-ac-pro',
        'bol',
        74900::bigint,
        'Bol productbron EUR 749 en partnerlink SKU-match; gecheckt 2026-07-29'
      ),
      (
        'anker-solix-solarbank-max-ac',
        'bol',
        209900::bigint,
        'Bol productbron EUR 2099 en partnerlink SKU-match; gecheckt 2026-07-29'
      ),
      (
        'sunology-storey',
        'sunology',
        139000::bigint,
        'Officiele STOREY productbron EUR 1390 en HTTPS titelmatch; gecheckt 2026-07-29'
      )
  ) as targets(product_slug, merchant_slug, price_cents, health_note)
  join products p on p.slug = targets.product_slug
  join merchants m on m.slug = targets.merchant_slug
) as prices
where o.product_id = prices.product_id
  and o.merchant_id = prices.merchant_id
  and o.deleted_at is null;

update products p
set
  indicative_price_min_cents = prices.price_cents,
  updated_at = now()
from (
  values
    ('marstek-venus-512', 138500::bigint),
    ('ecoflow-stream-ac-pro', 74900::bigint),
    ('anker-solix-solarbank-max-ac', 209900::bigint),
    ('sunology-storey', 139000::bigint)
) as prices(product_slug, price_cents)
where p.slug = prices.product_slug
  and p.deleted_at is null;
