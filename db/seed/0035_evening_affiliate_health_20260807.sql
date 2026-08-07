-- Avondcontrole affiliate- en offergezondheid.
-- Gecontroleerd: 2026-08-07T18:05:39Z.
--
-- Alle zestien Bol partnerlinks gaven HTTPS 301 naar het exacte productpad
-- en product-ID. De twee HomeWizard links en de Zendure link eindigden met
-- HTTPS 200 op het exacte productpad. De directe URLs van Sessy, Sunology,
-- EcoFlow, Stralendgroen en Uw Solar Installatie Shop gaven HTTPS 200.
--
-- Actuele prijsbronnen:
-- https://nl.ecoflow.com/products/stream-ac-pro-ac
-- https://www.zendure.nl/products/solarflow-800?variant=47143119290623
-- https://www.homewizard.com/nl/shop/plug-in-battery/
-- https://www.sessy.nl/bestellen/
-- https://sunology.eu/products/storey-batterie-stockage-plug-play
-- https://www.stralendgroen.nl/product/growatt-nexa-2000/
-- https://uwsolarinstallatieshop.nl/Thuisbatterijen/580-growatt-noah-2000.html
--
-- De offer-prijstrigger schrijft echte prijswijzigingen append-only naar
-- price_history. De gecontroleerde prijzen zijn vandaag niet gewijzigd.

-- Corrigeer eerst bekende concrete bestemmingen, zodat oude homepages niet
-- door de P0 scan als actief aanbod blijven bestaan.
update offers o
set
  affiliate_url = 'https://www.zendure.nl/products/solarflow-800?variant=47143119290623',
  affiliate_deeplink = 'https://glp8.net/c/?si=20779&li=1881195&wi=423133&ws=&dl=products%2Fsolarflow-800%3Fvariant%3D47143119290623',
  deleted_at = null,
  updated_at = now()
from products p
where o.product_id = p.id
  and o.merchant_id = (select id from merchants where slug = 'zendure')
  and p.slug = 'zendure-solarflow-800'
;

update offers o
set
  affiliate_url = 'https://nl.ecoflow.com/products/stream-ac-pro-ac',
  affiliate_link_status = 'pending',
  affiliate_link_note = 'P0: exacte EcoFlow product-URL gecontroleerd; Awin publisher-ID en deeplink ontbreken',
  affiliate_link_checked_at = '2026-08-07T18:05:39Z'::timestamptz,
  last_checked_at = '2026-08-07T18:05:39Z'::timestamptz,
  deleted_at = null,
  updated_at = now()
from products p
where o.product_id = p.id
  and o.merchant_id = (select id from merchants where slug = 'ecoflow')
  and p.slug = 'ecoflow-stream-ac-pro'
;

update offers o
set
  affiliate_url = 'https://www.sessy.nl/bestellen/',
  updated_at = now()
from products p
where o.product_id = p.id
  and o.merchant_id = (select id from merchants where slug = 'sessy')
  and p.slug = 'sessy-thuisbatterij'
  and o.deleted_at is null;

-- P0: verwijder zoekpagina's, listings, kale homepages en niet HTTPS URLs.
update offers
set
  stock_status = 'out_of_stock',
  affiliate_link_status = 'broken',
  affiliate_link_note = 'P0: zoekpagina, listing, homepage of ontbrekende HTTPS outbound soft-deleted 2026-08-07',
  affiliate_link_checked_at = '2026-08-07T18:05:39Z'::timestamptz,
  last_checked_at = '2026-08-07T18:05:39Z'::timestamptz,
  deleted_at = coalesce(deleted_at, now()),
  updated_at = now()
where deleted_at is null
  and (
    coalesce(affiliate_deeplink, affiliate_url) ~* 'bol[.]com/.*/s([?]|$)'
    or coalesce(affiliate_deeplink, affiliate_url) ~* 'searchtext='
    or coalesce(affiliate_deeplink, affiliate_url) ~* 'coolblue[.]nl/zoeken'
    or coalesce(affiliate_deeplink, affiliate_url)
       ~* '^https://[^/?#]+/?[?]([^#&]+&)*s='
    or coalesce(affiliate_deeplink, affiliate_url)
       ~* '^https://[^/?#]+/?([?#].*)?$'
    or coalesce(affiliate_deeplink, affiliate_url) ~* 'gamma[.]nl/assortiment'
    or coalesce(affiliate_deeplink, affiliate_url) is null
    or coalesce(affiliate_deeplink, affiliate_url) !~* '^https://'
  );

-- Werk alle vandaag verifieerbare actieve outbounds bij.
update offers o
set
  affiliate_link_status = 'ok',
  affiliate_link_note = case
    when verified.merchant_slug = 'bol'
      then 'Avondcontrole 2026-08-07: Bol partnerlink 301 naar exact HTTPS productpad en product-ID'
    when verified.merchant_slug in ('homewizard', 'zendure')
      then 'Avondcontrole 2026-08-07: Daisycon link geeft exact HTTPS productpad en SKU-match'
    else 'Avondcontrole 2026-08-07: directe product-URL geeft exact HTTPS productpad en SKU-match'
  end,
  affiliate_link_checked_at = '2026-08-07T18:05:39Z'::timestamptz,
  last_checked_at = '2026-08-07T18:05:39Z'::timestamptz,
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
      ('anker-solix-bp2700', 'bol'),
      ('growatt-nexa-2000', 'stralendgroen'),
      ('growatt-noah-2000', 'uw-solar-installatie-shop')
  ) as checks(product_slug, merchant_slug)
  join products p on p.slug = checks.product_slug
  join merchants m on m.slug = checks.merchant_slug
) as verified
where o.product_id = verified.product_id
  and o.merchant_id = verified.merchant_id
  and o.deleted_at is null;

-- EcoFlow blijft pending totdat een echte Awin publisherdeeplink beschikbaar is.
update offers o
set
  price_cents = 74900,
  stock_status = 'in_stock',
  affiliate_link_status = 'pending',
  affiliate_link_note = 'P0: EcoFlow STREAM AC Pro EUR 749 en product-URL gecontroleerd; Awin publisher-ID en deeplink ontbreken',
  affiliate_link_checked_at = '2026-08-07T18:05:39Z'::timestamptz,
  last_checked_at = '2026-08-07T18:05:39Z'::timestamptz,
  updated_at = now()
from products p
where o.product_id = p.id
  and o.merchant_id = (select id from merchants where slug = 'ecoflow')
  and p.slug = 'ecoflow-stream-ac-pro'
  and o.deleted_at is null;

-- Werk de citeerbare merkshopprijzen bij.
update offers o
set
  price_cents = prices.price_cents,
  stock_status = 'in_stock',
  affiliate_link_note = prices.health_note,
  affiliate_link_checked_at = prices.checked_at,
  last_checked_at = prices.checked_at,
  updated_at = now()
from (
  select
    p.id as product_id,
    m.id as merchant_id,
    targets.price_cents,
    targets.health_note,
    targets.checked_at
  from (
    values
      (
        'zendure-solarflow-800',
        'zendure',
        74700::bigint,
        'SolarFlow 800 plus AB2000L EUR 747 en Daisycon productpad gecontroleerd 2026-08-07',
        '2026-08-07T18:05:39Z'::timestamptz
      ),
      (
        'homewizard-plug-in-battery',
        'homewizard',
        119500::bigint,
        'HomeWizard merkshop EUR 1195 en Daisycon productpad gecontroleerd 2026-08-07',
        '2026-08-07T18:05:39Z'::timestamptz
      ),
      (
        'homewizard-plug-in-battery-bundle',
        'homewizard',
        239000::bigint,
        'HomeWizard merkshop, twee batterijen van EUR 1195, gecontroleerd 2026-08-07',
        '2026-08-07T18:05:39Z'::timestamptz
      ),
      (
        'sessy-thuisbatterij',
        'sessy',
        355000::bigint,
        'Sessy merkshop 5 kWh EUR 3550 en productconfigurator gecontroleerd 2026-08-07',
        '2026-08-07T18:05:39Z'::timestamptz
      ),
      (
        'sunology-storey',
        'sunology',
        139000::bigint,
        'Sunology STOREY EUR 1390 en exact productpad gecontroleerd 2026-08-07',
        '2026-08-07T18:05:39Z'::timestamptz
      ),
      (
        'growatt-nexa-2000',
        'stralendgroen',
        54500::bigint,
        'Growatt NEXA 2000 SKU 229066, EUR 545 en exact productpad gecontroleerd 2026-08-07',
        '2026-08-07T18:05:39Z'::timestamptz
      ),
      (
        'growatt-noah-2000',
        'uw-solar-installatie-shop',
        60379::bigint,
        'Growatt NOAH 2000 artikel O-G-NOAH-2000, EUR 603,79 en exact productpad gecontroleerd 2026-08-07',
        '2026-08-07T18:05:39Z'::timestamptz
      )
  ) as targets(product_slug, merchant_slug, price_cents, health_note, checked_at)
  join products p on p.slug = targets.product_slug
  join merchants m on m.slug = targets.merchant_slug
) as prices
where o.product_id = prices.product_id
  and o.merchant_id = prices.merchant_id
  and o.deleted_at is null;

-- Corrigeer STOREY met dezelfde officiele productbron.
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

-- PLAY is een zonnestation zonder batterij-SKU. De Sessy Duo gebruikt geen
-- eigen productpad en heeft geen affiliate deeplink. Beide blijven verwijderd.
update offers o
set
  stock_status = 'out_of_stock',
  affiliate_link_status = 'broken',
  affiliate_link_note = blocked.health_note,
  affiliate_link_checked_at = '2026-08-07T18:05:39Z'::timestamptz,
  last_checked_at = '2026-08-07T18:05:39Z'::timestamptz,
  deleted_at = coalesce(o.deleted_at, now()),
  updated_at = now()
from (
  select p.id as product_id, m.id as merchant_id, targets.health_note
  from (
    values
      (
        'sunology-play',
        'sunology',
        'P0: Sunology PLAY is een zonnestation zonder batterij-SKU; soft-deleted 2026-08-07'
      ),
      (
        'sessy-thuisbatterij-duo',
        'sessy',
        'P0: Sessy Duo heeft geen eigen productpad of affiliate deeplink; soft-deleted 2026-08-07'
      )
  ) as targets(product_slug, merchant_slug, health_note)
  join products p on p.slug = targets.product_slug
  join merchants m on m.slug = targets.merchant_slug
) as blocked
where o.product_id = blocked.product_id
  and o.merchant_id = blocked.merchant_id;

update offers o
set
  price_cents = 550000,
  updated_at = now()
from products p
where o.product_id = p.id
  and o.merchant_id = (select id from merchants where slug = 'sessy')
  and p.slug = 'sessy-thuisbatterij-duo'
;

update products
set
  status = 'draft',
  published_at = null,
  updated_at = now()
where slug = 'sunology-play'
  and deleted_at is null;

-- Geen broken offer mag actief blijven.
update offers
set
  stock_status = 'out_of_stock',
  affiliate_link_note = coalesce(
    affiliate_link_note,
    'P0: broken offer soft-deleted na avondcontrole 2026-08-07'
  ),
  affiliate_link_checked_at = '2026-08-07T18:05:39Z'::timestamptz,
  last_checked_at = '2026-08-07T18:05:39Z'::timestamptz,
  deleted_at = coalesce(deleted_at, now()),
  updated_at = now()
where affiliate_link_status = 'broken'
  and deleted_at is null;

-- Bewaak de postconditie: geen actieve zoekpagina, listing, homepage,
-- ontbrekende HTTPS URL of broken offer.
do $$
declare
  offender_count integer;
begin
  select count(*)
  into offender_count
  from offers
  where deleted_at is null
    and (
      coalesce(affiliate_deeplink, affiliate_url) ~* 'bol[.]com/.*/s([?]|$)'
      or coalesce(affiliate_deeplink, affiliate_url) ~* 'searchtext='
      or coalesce(affiliate_deeplink, affiliate_url) ~* 'coolblue[.]nl/zoeken'
      or coalesce(affiliate_deeplink, affiliate_url)
         ~* '^https://[^/?#]+/?[?]([^#&]+&)*s='
      or coalesce(affiliate_deeplink, affiliate_url)
         ~* '^https://[^/?#]+/?([?#].*)?$'
      or coalesce(affiliate_deeplink, affiliate_url) ~* 'gamma[.]nl/assortiment'
      or coalesce(affiliate_deeplink, affiliate_url) is null
      or coalesce(affiliate_deeplink, affiliate_url) !~* '^https://'
      or affiliate_link_status = 'broken'
    );

  if offender_count <> 0 then
    raise exception 'P0 outbound scan failed: % active offenders', offender_count;
  end if;
end
$$;
