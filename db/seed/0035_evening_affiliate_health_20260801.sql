-- Avondcontrole affiliate- en offergezondheid.
-- Gecontroleerd: 2026-08-01T18:10:00Z.
--
-- Affiliatebronnen:
-- Bol partnerlinks: HTTPS 301 naar de exact gecodeerde product-URL en SKU.
-- Zendure: https://www.zendure.nl/products/solarflow-800?variant=47143119290623
-- HomeWizard: https://www.homewizard.com/nl/shop/plug-in-battery/
-- Sessy: https://www.sessy.nl/bestellen/
-- Sunology STOREY: https://sunology.eu/products/storey-batterie-stockage-plug-play
-- EcoFlow: https://nl.ecoflow.com/products/stream-ac-pro-ac
--
-- Prijsbronnen:
-- EcoFlow STREAM AC Pro:
-- https://nl.ecoflow.com/products/stream-ac-pro-ac
-- Zendure SolarFlow 800 plus AB2000L:
-- https://www.zendure.nl/products/solarflow-800?variant=47143119290623
-- HomeWizard Plug-In Battery:
-- https://www.homewizard.com/nl/shop/plug-in-battery/
-- Sessy 5 kWh:
-- https://www.sessy.nl/bestellen/
-- Sunology STOREY:
-- https://sunology.eu/products/storey-batterie-stockage-plug-play
-- Anker Max AC, EcoFlow bij Bol en Marstek zijn voor het laatst op hun exacte
-- productpagina gecontroleerd op 2026-07-31 of 2026-08-01. De Bol pagina zelf
-- blokkeerde deze runtime met HTTP 403, maar de partnerlink bleef exact werken.
--
-- De offer-prijstrigger schrijft elke prijswijziging append-only naar price_history.

-- P0: verwijder zoekpagina's, listingpagina's, kale homepages en offers zonder HTTPS.
-- De WordPress-parameter s telt alleen op een kale homepage. Hierdoor blijft de
-- geldige Bol partnerparameter s=1532194 buiten deze blokkade.
update offers
set
  stock_status = 'out_of_stock',
  affiliate_link_status = 'broken',
  affiliate_link_note = 'P0: zoek/listing/homepage of ontbrekende HTTPS outbound soft-deleted 2026-08-01',
  affiliate_link_checked_at = '2026-08-01T18:10:00Z'::timestamptz,
  last_checked_at = '2026-08-01T18:10:00Z'::timestamptz,
  deleted_at = coalesce(deleted_at, now()),
  updated_at = now()
where deleted_at is null
  and (
    coalesce(affiliate_deeplink, affiliate_url) ~* 'bol\.com/.*/s(\?|$)'
    or coalesce(affiliate_deeplink, affiliate_url) ~* 'searchtext='
    or coalesce(affiliate_deeplink, affiliate_url) ~* 'coolblue\.nl/zoeken'
    or coalesce(affiliate_deeplink, affiliate_url)
       ~* '^https://[^/?#]+/?\?([^#&]+&)*s='
    or coalesce(affiliate_deeplink, affiliate_url)
       ~* '^https://[^/?#]+/?([?#].*)?$'
    or coalesce(affiliate_deeplink, affiliate_url) ~* 'gamma\.nl/assortiment'
    or coalesce(affiliate_deeplink, affiliate_url) is null
    or coalesce(affiliate_deeplink, affiliate_url) !~* '^https://'
  );

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
      then 'Avondcontrole 2026-08-01: Bol partnerlink 301 naar exacte HTTPS product-URL en SKU'
    when verified.merchant_slug in ('homewizard', 'zendure')
      then 'Avondcontrole 2026-08-01: Daisycon-link eindigt op exact HTTPS productpad en SKU-match'
    else 'Avondcontrole 2026-08-01: product-URL eindigt op exact HTTPS productpad en SKU-match'
  end,
  affiliate_link_checked_at = '2026-08-01T18:10:00Z'::timestamptz,
  last_checked_at = '2026-08-01T18:10:00Z'::timestamptz,
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
-- op een algemene configurator zonder een specifieke Duo-configuratie.
update offers o
set
  stock_status = 'out_of_stock',
  affiliate_link_status = 'broken',
  affiliate_link_note = blocked.health_note,
  affiliate_link_checked_at = '2026-08-01T18:10:00Z'::timestamptz,
  last_checked_at = '2026-08-01T18:10:00Z'::timestamptz,
  deleted_at = coalesce(o.deleted_at, now()),
  updated_at = now()
from (
  select p.id as product_id, m.id as merchant_id, targets.health_note
  from (
    values
      (
        'sunology-play',
        'sunology',
        'P0: URL verkoopt een PLAY zonnepaneelset zonder batterij-SKU; soft-deleted 2026-08-01'
      ),
      (
        'sessy-thuisbatterij-duo',
        'sessy',
        'P0: URL heeft geen specifieke Duo-SKU of Duo-prijs; soft-deleted 2026-08-01'
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

-- Broken offers mogen niet actief blijven, ook niet bij verwijderde producten.
update offers
set
  stock_status = 'out_of_stock',
  affiliate_link_note = coalesce(
    affiliate_link_note,
    'P0: broken offer soft-deleted na avondcontrole 2026-08-01'
  ),
  affiliate_link_checked_at = '2026-08-01T18:10:00Z'::timestamptz,
  last_checked_at = '2026-08-01T18:10:00Z'::timestamptz,
  deleted_at = coalesce(deleted_at, now()),
  updated_at = now()
where affiliate_link_status = 'broken'
  and deleted_at is null;

-- EcoFlow heeft een exacte product-URL en een actuele merkshopprijs.
-- De offer blijft pending totdat een echte Awin publisherdeeplink beschikbaar is.
update offers o
set
  price_cents = 74900,
  stock_status = 'in_stock',
  affiliate_url = 'https://nl.ecoflow.com/products/stream-ac-pro-ac',
  affiliate_link_status = 'pending',
  affiliate_link_note = 'P0: exacte EcoFlow product-URL en EUR 749 gecontroleerd; Awin publisher-ID en deeplink ontbreken',
  affiliate_link_checked_at = '2026-08-01T18:10:00Z'::timestamptz,
  last_checked_at = '2026-08-01T18:10:00Z'::timestamptz,
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

-- Bronprijzen van de topgeklikte producten.
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
        'ecoflow-stream-ac-pro',
        'bol',
        74900::bigint,
        'Bol productbron EUR 749 en partnerlink SKU-match; prijs gecheckt 2026-07-31, link hercheckt 2026-08-01',
        '2026-08-01T18:10:00Z'::timestamptz
      ),
      (
        'anker-solix-solarbank-max-ac',
        'bol',
        209900::bigint,
        'Bol productbron EUR 2099 en partnerlink SKU-match; prijs gecheckt 2026-07-31, link hercheckt 2026-08-01',
        '2026-08-01T18:10:00Z'::timestamptz
      ),
      (
        'marstek-venus-512',
        'bol',
        130000::bigint,
        'Bol productbron EUR 1300 en partnerlink SKU-match; gecheckt 2026-08-01',
        '2026-08-01T18:10:00Z'::timestamptz
      ),
      (
        'zendure-solarflow-800',
        'zendure',
        74700::bigint,
        'Zendure productbron SolarFlow 800 plus AB2000L EUR 747; gecheckt 2026-08-01',
        '2026-08-01T18:10:00Z'::timestamptz
      ),
      (
        'homewizard-plug-in-battery',
        'homewizard',
        119500::bigint,
        'HomeWizard merkshop EUR 1195; gecheckt 2026-08-01',
        '2026-08-01T18:10:00Z'::timestamptz
      ),
      (
        'homewizard-plug-in-battery-bundle',
        'homewizard',
        239000::bigint,
        'HomeWizard merkshop, twee batterijen van EUR 1195; gecheckt 2026-08-01',
        '2026-08-01T18:10:00Z'::timestamptz
      ),
      (
        'sessy-thuisbatterij',
        'sessy',
        355000::bigint,
        'Sessy merkshop 5 kWh EUR 3550; affiliate deeplink ontbreekt; gecheckt 2026-08-01',
        '2026-08-01T18:10:00Z'::timestamptz
      ),
      (
        'sunology-storey',
        'sunology',
        139000::bigint,
        'Officiele STOREY productbron EUR 1390 en HTTPS titelmatch; gecheckt 2026-08-01',
        '2026-08-01T18:10:00Z'::timestamptz
      )
  ) as targets(product_slug, merchant_slug, price_cents, health_note, checked_at)
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
    ('ecoflow-stream-ac-pro', 74900::bigint),
    ('anker-solix-solarbank-max-ac', 209900::bigint),
    ('marstek-venus-512', 130000::bigint),
    ('zendure-solarflow-800', 74700::bigint),
    ('homewizard-plug-in-battery', 119500::bigint),
    ('homewizard-plug-in-battery-bundle', 239000::bigint),
    ('sessy-thuisbatterij', 355000::bigint),
    ('sunology-storey', 139000::bigint)
) as prices(product_slug, price_cents)
where p.slug = prices.product_slug
  and p.deleted_at is null;

-- De P0 scan moet na deze seed altijd nul actieve offenders opleveren.
do $$
declare
  offender_count integer;
begin
  select count(*)
  into offender_count
  from offers
  where deleted_at is null
    and (
      coalesce(affiliate_deeplink, affiliate_url) ~* 'bol\.com/.*/s(\?|$)'
      or coalesce(affiliate_deeplink, affiliate_url) ~* 'searchtext='
      or coalesce(affiliate_deeplink, affiliate_url) ~* 'coolblue\.nl/zoeken'
      or coalesce(affiliate_deeplink, affiliate_url)
         ~* '^https://[^/?#]+/?\?([^#&]+&)*s='
      or coalesce(affiliate_deeplink, affiliate_url)
         ~* '^https://[^/?#]+/?([?#].*)?$'
      or coalesce(affiliate_deeplink, affiliate_url) ~* 'gamma\.nl/assortiment'
      or coalesce(affiliate_deeplink, affiliate_url) is null
      or coalesce(affiliate_deeplink, affiliate_url) !~* '^https://'
    );

  if offender_count <> 0 then
    raise exception 'P0 outbound scan failed: % active offenders', offender_count;
  end if;
end
$$;
