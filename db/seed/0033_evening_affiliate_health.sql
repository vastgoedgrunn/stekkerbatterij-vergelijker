-- Avondcontrole affiliate- en offergezondheid.
-- Gecontroleerd: 2026-07-21T18:11:36Z.
--
-- Alle genoemde affiliate-deeplinks kwamen via HTTPS met status 200 uit op
-- het verwachte product en SKU. De directe Sessy- en Sunology-links gaven
-- status 200 en een passende paginatitel.

update offers o
set
  affiliate_link_status = 'ok',
  affiliate_link_note = verified.health_note,
  affiliate_link_checked_at = '2026-07-21T18:11:36Z'::timestamptz,
  updated_at = now()
from (
  values
    ('homewizard-p1-meter', 'bol', 'Avondcontrole 2026-07-21: affiliate-deeplink HTTPS 200 en SKU-match'),
    ('p1-kabel-10m', 'bol', 'Avondcontrole 2026-07-21: affiliate-deeplink HTTPS 200 en SKU-match'),
    ('p1-kabel-5m', 'bol', 'Avondcontrole 2026-07-21: affiliate-deeplink HTTPS 200 en SKU-match'),
    ('ecoflow-stream-ac-pro', 'bol', 'Avondcontrole 2026-07-21: affiliate-deeplink HTTPS 200 en SKU-match'),
    ('zendure-solarflow-800', 'zendure', 'Avondcontrole 2026-07-21: Daisycon-deeplink HTTPS 200 en SKU-match'),
    ('homewizard-p1-voeding', 'bol', 'Avondcontrole 2026-07-21: affiliate-deeplink HTTPS 200 en SKU-match'),
    ('anker-solix-solarbank-2-e1600-pro', 'bol', 'Avondcontrole 2026-07-21: affiliate-deeplink HTTPS 200 en SKU-match'),
    ('marstek-venus-512', 'bol', 'Avondcontrole 2026-07-21: affiliate-deeplink HTTPS 200 en SKU-match'),
    ('homewizard-actieve-p1-splitter', 'bol', 'Avondcontrole 2026-07-21: affiliate-deeplink HTTPS 200 en SKU-match'),
    ('anker-solix-power-dock', 'bol', 'Avondcontrole 2026-07-21: affiliate-deeplink HTTPS 200 en SKU-match'),
    ('homewizard-plug-in-battery-bundle', 'homewizard', 'Avondcontrole 2026-07-21: Daisycon-deeplink HTTPS 200 en SKU-match'),
    ('zendure-ab3000x', 'bol', 'Avondcontrole 2026-07-21: affiliate-deeplink HTTPS 200 en SKU-match'),
    ('homewizard-plug-in-battery', 'homewizard', 'Avondcontrole 2026-07-21: Daisycon-deeplink HTTPS 200 en SKU-match'),
    ('p1-kabel-3m', 'bol', 'Avondcontrole 2026-07-21: affiliate-deeplink HTTPS 200 en SKU-match'),
    ('homewizard-energy-socket', 'bol', 'Avondcontrole 2026-07-21: affiliate-deeplink HTTPS 200 en SKU-match'),
    ('anker-solix-bp2700', 'bol', 'Avondcontrole 2026-07-21: affiliate-deeplink HTTPS 200 en SKU-match'),
    ('anker-solix-solarbank-max-ac', 'bol', 'Avondcontrole 2026-07-21: affiliate-deeplink HTTPS 200 en SKU-match'),
    ('anker-solix-bp3800', 'bol', 'Avondcontrole 2026-07-21: affiliate-deeplink HTTPS 200 en SKU-match'),
    ('homewizard-energy-display', 'bol', 'Avondcontrole 2026-07-21: affiliate-deeplink HTTPS 200 en SKU-match'),
    ('sessy-thuisbatterij', 'sessy', 'Avondcontrole 2026-07-21: productpagina HTTPS 200 en titelmatch'),
    ('sunology-storey', 'sunology', 'Avondcontrole 2026-07-21: productpagina HTTPS 200 en titelmatch')
) as verified(product_slug, merchant_slug, health_note),
products p,
merchants m
where p.slug = verified.product_slug
  and m.slug = verified.merchant_slug
  and o.product_id = p.id
  and o.merchant_id = m.id
  and o.deleted_at is null;

-- De Sessy-pagina verkoopt alleen de single-SKU. Er is geen aparte Duo-pagina.
update offers o
set
  stock_status = 'out_of_stock',
  affiliate_link_status = 'broken',
  affiliate_link_note = 'P0: pagina verkoopt Sessy single, geen verifieerbare Duo-SKU; soft-deleted 2026-07-21',
  affiliate_link_checked_at = '2026-07-21T18:11:36Z'::timestamptz,
  deleted_at = coalesce(o.deleted_at, now()),
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'sessy-thuisbatterij-duo'
  and m.slug = 'sessy';

-- EcoFlow Awin heeft nog geen publisherdeeplink of specifieke productpagina.
update offers o
set
  stock_status = 'out_of_stock',
  affiliate_link_status = 'broken',
  affiliate_link_note = 'P0: EcoFlow Awin productdeeplink ontbreekt; homepage soft-deleted 2026-07-21',
  affiliate_link_checked_at = '2026-07-21T18:11:36Z'::timestamptz,
  deleted_at = coalesce(o.deleted_at, now()),
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'ecoflow-stream-ac-pro'
  and m.slug = 'ecoflow';

-- Reeds broken offers bij niet-gepubliceerde producten mogen niet actief blijven.
update offers o
set
  deleted_at = coalesce(o.deleted_at, now()),
  affiliate_link_note = coalesce(o.affiliate_link_note, 'P0: broken offer bij niet-gepubliceerd product soft-deleted'),
  affiliate_link_checked_at = coalesce(
    o.affiliate_link_checked_at,
    '2026-07-21T18:11:36Z'::timestamptz
  ),
  updated_at = now()
from products p
where o.product_id = p.id
  and p.status <> 'published'
  and o.affiliate_link_status = 'broken'
  and o.deleted_at is null;
