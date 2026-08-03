-- Avondcontrole affiliate- en offergezondheid.
-- Gecontroleerd: 2026-08-03T18:04:54Z.
--
-- Zestien Bol partnerlinks gaven met een browserclient HTTPS 301 naar het
-- exacte productpad en product-ID. De trackingserver stuurt bekende bots naar
-- de Bol homepage, daarom controleert verifyOutboundForProduct voortaan de
-- eerste redirect met een browser user agent.
-- HomeWizard gaf via Daisycon HTTPS 200 op beide exacte productpaden.
-- Zendure gaf via Daisycon HTTPS 200 op de exacte SolarFlow variant.
-- Sessy gaf HTTPS 200 op de productconfigurator.
-- Sunology gaf HTTP 429 en blijft pending tot een volgende controle.
--
-- Prijsbronnen:
-- https://nl.ecoflow.com/products/stream-ac-pro-ac
-- https://www.zendure.nl/products/solarflow-800?variant=47143119290623
-- https://www.homewizard.com/nl/shop/plug-in-battery/
-- https://www.sessy.nl/bestellen/

-- Werk alle vandaag verifieerbare actieve outbounds bij.
update offers o
set
  affiliate_link_status = 'ok',
  affiliate_link_note = case
    when verified.merchant_slug = 'bol'
      then 'Avondcontrole 2026-08-03: Bol partnerlink 301 naar exact HTTPS productpad en product-ID'
    when verified.merchant_slug in ('homewizard', 'zendure')
      then 'Avondcontrole 2026-08-03: Daisycon-link geeft exact HTTPS productpad en SKU-match'
    else 'Avondcontrole 2026-08-03: directe product-URL geeft exact HTTPS productpad en SKU-match'
  end,
  affiliate_link_checked_at = '2026-08-03T18:04:54Z'::timestamptz,
  last_checked_at = '2026-08-03T18:04:54Z'::timestamptz,
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

-- De Sunology bron was vandaag niet betrouwbaar te controleren door rate limiting.
update offers o
set
  affiliate_link_status = 'pending',
  affiliate_link_note = 'Avondcontrole 2026-08-03: exacte STOREY URL gaf HTTP 429; opnieuw controleren',
  affiliate_link_checked_at = '2026-08-03T18:04:54Z'::timestamptz,
  last_checked_at = '2026-08-03T18:04:54Z'::timestamptz,
  updated_at = now()
where o.product_id = (select id from products where slug = 'sunology-storey')
  and o.merchant_id = (select id from merchants where slug = 'sunology')
  and o.deleted_at is null;

-- EcoFlow blijft pending totdat de echte Awin publisherdeeplink beschikbaar is.
update offers o
set
  price_cents = 74900,
  stock_status = 'in_stock',
  affiliate_url = 'https://nl.ecoflow.com/products/stream-ac-pro-ac',
  affiliate_link_status = 'pending',
  affiliate_link_note = 'P0: EcoFlow product-URL en EUR 749 gecontroleerd; Awin publisher-ID en deeplink ontbreken',
  affiliate_link_checked_at = '2026-08-03T18:04:54Z'::timestamptz,
  last_checked_at = '2026-08-03T18:04:54Z'::timestamptz,
  updated_at = now()
where o.product_id = (select id from products where slug = 'ecoflow-stream-ac-pro')
  and o.merchant_id = (select id from merchants where slug = 'ecoflow')
  and o.deleted_at is null;

-- De geverifieerde merkshopprijzen bleven gelijk.
update offers o
set
  price_cents = prices.price_cents,
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
        'SolarFlow 800 plus AB2000L EUR 747 en Daisycon productpad gecontroleerd 2026-08-03',
        '2026-08-03T18:04:54Z'::timestamptz
      ),
      (
        'homewizard-plug-in-battery',
        'homewizard',
        119500::bigint,
        'HomeWizard merkshop EUR 1195 en Daisycon productpad gecontroleerd 2026-08-03',
        '2026-08-03T18:04:54Z'::timestamptz
      ),
      (
        'homewizard-plug-in-battery-bundle',
        'homewizard',
        239000::bigint,
        'HomeWizard merkshop, twee batterijen van EUR 1195, gecontroleerd 2026-08-03',
        '2026-08-03T18:04:54Z'::timestamptz
      ),
      (
        'sessy-thuisbatterij',
        'sessy',
        355000::bigint,
        'Sessy merkshop 5 kWh EUR 3550 en productconfigurator gecontroleerd 2026-08-03',
        '2026-08-03T18:04:54Z'::timestamptz
      )
  ) as targets(product_slug, merchant_slug, price_cents, health_note, checked_at)
  join products p on p.slug = targets.product_slug
  join merchants m on m.slug = targets.merchant_slug
) as prices
where o.product_id = prices.product_id
  and o.merchant_id = prices.merchant_id
  and o.deleted_at is null;

-- De Sessy configurator toont nu 10 kWh voor EUR 5500.
-- De Duo-offer blijft verwijderd omdat een affiliate deeplink ontbreekt.
update offers o
set
  price_cents = 550000,
  affiliate_link_status = 'broken',
  affiliate_link_note = 'P0: Sessy 10 kWh en EUR 5500 geverifieerd, maar affiliate deeplink ontbreekt',
  affiliate_link_checked_at = '2026-08-03T18:04:54Z'::timestamptz,
  last_checked_at = '2026-08-03T18:04:54Z'::timestamptz,
  deleted_at = coalesce(o.deleted_at, now()),
  updated_at = now()
where o.product_id = (select id from products where slug = 'sessy-thuisbatterij-duo')
  and o.merchant_id = (select id from merchants where slug = 'sessy');

update products
set
  indicative_price_min_cents = 550000,
  updated_at = now()
where slug = 'sessy-thuisbatterij-duo'
  and deleted_at is null;

-- Bewaak de postconditie: geen actieve zoek-, listing-, homepage- of broken outbound.
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
      or affiliate_link_status = 'broken'
    );

  if offender_count <> 0 then
    raise exception 'P0 outbound scan failed: % active offenders', offender_count;
  end if;
end
$$;
