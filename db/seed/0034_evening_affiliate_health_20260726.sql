-- Avondcontrole affiliate- en offergezondheid.
-- Gecontroleerd: 2026-07-26T18:07:09Z.
--
-- Bol partnerlinks stuurden met HTTPS 301 naar de exacte product-URL en SKU.
-- Bol gaf daarna HTTP 403 aan het automation-IP; de product-URL's en actuele
-- prijzen zijn daarom ook via de geciteerde Bol productbronnen gecontroleerd.
-- Directe merkshop- en Daisycon-links gaven HTTPS 200 met een passende titel.

update offers o
set
  affiliate_link_status = 'ok',
  affiliate_link_note = case
    when verified.merchant_slug = 'bol'
      then 'Avondcontrole 2026-07-26: Bol partnerlink 301 naar exacte HTTPS product-URL en SKU; bestemming blokkeerde automation-IP met 403'
    when verified.merchant_slug in ('homewizard', 'zendure')
      then 'Avondcontrole 2026-07-26: Daisycon-link HTTPS 200 en SKU-match'
    else 'Avondcontrole 2026-07-26: productpagina HTTPS 200 en titelmatch'
  end,
  affiliate_link_checked_at = '2026-07-26T18:07:09Z'::timestamptz,
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

-- Drie actieve offers zijn geen verifieerbare product-outbound.
update offers o
set
  stock_status = 'out_of_stock',
  affiliate_link_status = 'broken',
  affiliate_link_note = blocked.health_note,
  affiliate_link_checked_at = '2026-07-26T18:07:09Z'::timestamptz,
  last_checked_at = '2026-07-26T18:07:09Z'::timestamptz,
  deleted_at = coalesce(o.deleted_at, now()),
  updated_at = now()
from (
  select p.id as product_id, m.id as merchant_id, targets.health_note
  from (
    values
      (
        'sunology-play',
        'sunology',
        'P0: URL opent een PLAY zonnepaneelset zonder batterij; soft-deleted 2026-07-26'
      ),
      (
        'sessy-thuisbatterij-duo',
        'sessy',
        'P0: URL verkoopt de Sessy single, geen verifieerbare Duo-SKU; soft-deleted 2026-07-26'
      ),
      (
        'ecoflow-stream-ac-pro',
        'ecoflow',
        'P0: EcoFlow Awin publisherdeeplink en specifieke product-URL ontbreken; homepage soft-deleted 2026-07-26'
      )
  ) as targets(product_slug, merchant_slug, health_note)
  join products p on p.slug = targets.product_slug
  join merchants m on m.slug = targets.merchant_slug
) as blocked
where o.product_id = blocked.product_id
  and o.merchant_id = blocked.merchant_id;

-- Broken offers bij niet-gepubliceerde producten mogen niet actief blijven.
update offers o
set
  deleted_at = coalesce(o.deleted_at, now()),
  affiliate_link_note = coalesce(
    o.affiliate_link_note,
    'P0: broken offer bij niet-gepubliceerd product soft-deleted 2026-07-26'
  ),
  affiliate_link_checked_at = '2026-07-26T18:07:09Z'::timestamptz,
  updated_at = now()
from products p
where o.product_id = p.id
  and p.status <> 'published'
  and o.affiliate_link_status = 'broken'
  and o.deleted_at is null;

-- Sunology PLAY is geen batterij-SKU en blijft uit de publieke catalogus.
update products
set
  status = 'draft',
  published_at = null,
  updated_at = now()
where slug = 'sunology-play'
  and deleted_at is null;

-- STOREY bron: https://sunology.eu/products/storey-batterie-stockage-plug-play
-- Master: 2200 Wh, 500 W, IP64, 30,5 kg, 7500 cycli, 15 jaar, EUR 1390.
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

-- Prijsupdates met productbron. De offertrigger schrijft elke wijziging
-- append-only naar price_history.
-- EcoFlow bron:
-- https://www.bol.com/nl/nl/p/ecoflow-stream-ac-pro-thuisbatterij/9300000232241116/
-- Anker bron:
-- https://www.bol.com/nl/nl/p/anker-solix-solarbank-max-ac-balkonkrachtwerk-met-opslag-7kwh-3600w-alles-in-1-plug-play-thuisaccu-10000-cycli-5-min-installatie-zonnepaneel-met-omvormer/9300000292343906/
update offers o
set
  price_cents = prices.price_cents,
  stock_status = 'in_stock',
  affiliate_link_note = prices.health_note,
  affiliate_link_checked_at = '2026-07-26T18:07:09Z'::timestamptz,
  last_checked_at = '2026-07-26T18:07:09Z'::timestamptz,
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
        'ecoflow-stream-ac-pro',
        'bol',
        74900::bigint,
        'Bol productbron EUR 749 en partnerlink SKU-match; gecheckt 2026-07-26'
      ),
      (
        'anker-solix-solarbank-max-ac',
        'bol',
        209900::bigint,
        'Bol productbron EUR 2099 en partnerlink SKU-match; gecheckt 2026-07-26'
      ),
      (
        'sunology-storey',
        'sunology',
        139000::bigint,
        'Officiele STOREY productbron EUR 1390 en HTTPS titelmatch; gecheckt 2026-07-26'
      )
  ) as targets(product_slug, merchant_slug, price_cents, health_note)
  join products p on p.slug = targets.product_slug
  join merchants m on m.slug = targets.merchant_slug
) as prices
where o.product_id = prices.product_id
  and o.merchant_id = prices.merchant_id
  and o.deleted_at is null;

update products
set
  indicative_price_min_cents = 209900,
  updated_at = now()
where slug = 'anker-solix-solarbank-max-ac'
  and deleted_at is null;
