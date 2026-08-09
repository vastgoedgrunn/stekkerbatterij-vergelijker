-- Bestaande offerprijzen opnieuw gecontroleerd op 2026-08-09T06:04:18Z.
-- Elke bevestigde merchantprijs wordt volledig automatisch verwerkt.
--
-- Anker Max AC, actuele Bol productprijs EUR 2199:
-- https://www.bol.com/nl/nl/p/anker-solix-solarbank-max-ac-balkonkrachtwerk-met-opslag-7kwh-3600w-alles-in-1-plug-play-thuisaccu-10000-cycli-5-min-installatie-zonnepaneel-met-omvormer/9300000292343906/
-- Zendure SolarFlow 800 plus AB2000L:
-- https://www.zendure.nl/products/solarflow-800
-- HomeWizard Plug-In Battery:
-- https://www.homewizard.com/nl/shop/plug-in-battery/
-- Sessy 5 kWh:
-- https://www.sessy.nl/prijsinformatie/
-- Marstek Venus E 3.0:
-- https://www.bol.com/nl/nl/p/marstek-venus-e-3-0-5-12kwh-plug-play-thuisbatterij-via-230v-stopcontact/9300000240523865/
--
-- De actuele Anker bronprijs blijft EUR 2199.
-- Trigger t_offers_price schrijft alleen echte prijswijzigingen append-only naar price_history.

update offers o
set
  price_cents = 219900,
  stock_status = 'in_stock',
  affiliate_link_note = 'Bol productpagina EAN 0194644338664, EUR 2199, gecheckt 2026-08-09T06:04:18Z',
  affiliate_link_checked_at = '2026-08-09T06:04:18Z'::timestamptz,
  last_checked_at = '2026-08-09T06:04:18Z'::timestamptz,
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'anker-solix-solarbank-max-ac'
  and m.slug = 'bol'
  and o.deleted_at is null;

update products
set indicative_price_min_cents = 219900, updated_at = now()
where slug = 'anker-solix-solarbank-max-ac'
  and deleted_at is null;

update offers o
set
  price_cents = 74700,
  stock_status = 'in_stock',
  affiliate_link_note = 'Daisycon deeplink naar SolarFlow 800; Nederlandse setprijs EUR 747, gecheckt 2026-08-09T06:04:18Z',
  affiliate_link_checked_at = '2026-08-09T06:04:18Z'::timestamptz,
  last_checked_at = '2026-08-09T06:04:18Z'::timestamptz,
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'zendure-solarflow-800'
  and m.slug = 'zendure'
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
      then 'HomeWizard merkshop, twee batterijen van EUR 1195; gecheckt 2026-08-09T06:04:18Z'
    else 'HomeWizard merkshop, EUR 1195; gecheckt 2026-08-09T06:04:18Z'
  end,
  affiliate_link_checked_at = '2026-08-09T06:04:18Z'::timestamptz,
  last_checked_at = '2026-08-09T06:04:18Z'::timestamptz,
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
  affiliate_link_note = 'Sessy prijsinformatie, 5 kWh EUR 3550; affiliate deeplink ontbreekt, plak deeplink zodra netwerk open is; gecheckt 2026-08-09T06:04:18Z',
  affiliate_link_checked_at = '2026-08-09T06:04:18Z'::timestamptz,
  last_checked_at = '2026-08-09T06:04:18Z'::timestamptz,
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'sessy-thuisbatterij'
  and m.slug = 'sessy'
  and o.deleted_at is null;

update offers o
set
  affiliate_link_note = 'De bron toont een Sessy 10 kWh-configuratie voor EUR 5500 zonder harde match met de bestaande Duo; prijs niet gewijzigd, affiliate deeplink ontbreekt, plak deeplink zodra netwerk open is; gecheckt 2026-08-09T06:04:18Z',
  affiliate_link_checked_at = '2026-08-09T06:04:18Z'::timestamptz,
  last_checked_at = '2026-08-09T06:04:18Z'::timestamptz,
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'sessy-thuisbatterij-duo'
  and m.slug = 'sessy'
  and o.deleted_at is null;

update offers o
set
  price_cents = 130000,
  stock_status = 'in_stock',
  affiliate_link_note = 'Bol productpagina 9300000240523865, EUR 1300, gecheckt 2026-08-09T06:04:18Z',
  affiliate_link_checked_at = '2026-08-09T06:04:18Z'::timestamptz,
  last_checked_at = '2026-08-09T06:04:18Z'::timestamptz,
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'marstek-venus-512'
  and m.slug = 'bol'
  and o.deleted_at is null;

-- EcoFlow STREAM AC Pro merkshop:
-- https://nl.ecoflow.com/products/stream-ac-pro-ac
-- De actuele actieprijs EUR 749 is 7,3 procent hoger dan productie en wordt automatisch verwerkt.
-- De concrete product-URL vervangt de kale merkhomepage.
update offers o
set
  price_cents = 74900,
  stock_status = 'in_stock',
  affiliate_url = 'https://nl.ecoflow.com/products/stream-ac-pro-ac',
  affiliate_link_status = 'pending',
  affiliate_link_note = 'EcoFlow merkshop actieprijs EUR 749; Awin deeplink ontbreekt, plak deeplink zodra netwerk open is; gecheckt 2026-08-09T06:04:18Z',
  affiliate_link_checked_at = '2026-08-09T06:04:18Z'::timestamptz,
  last_checked_at = '2026-08-09T06:04:18Z'::timestamptz,
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'ecoflow-stream-ac-pro'
  and m.slug = 'ecoflow'
  and o.deleted_at is null;

-- Sunology STOREY:
-- https://sunology.eu/products/storey-batterie-stockage-plug-play
-- De actuele EUR 1390 is 44,4 procent lager dan productie en wordt automatisch verwerkt.
update offers o
set
  price_cents = 139000,
  stock_status = 'in_stock',
  affiliate_link_note = 'Sunology STOREY merkshop EUR 1390; affiliate deeplink ontbreekt, plak deeplink zodra netwerk open is; gecheckt 2026-08-09T06:04:18Z',
  affiliate_link_checked_at = '2026-08-09T06:04:18Z'::timestamptz,
  last_checked_at = '2026-08-09T06:04:18Z'::timestamptz,
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'sunology-storey'
  and m.slug = 'sunology'
  and o.deleted_at is null;
