-- Zendure SolarFlow 800 met één AB2000L-batterij, opnieuw gecontroleerd
-- op 2026-08-09T05:03:46Z.
-- De productpagina toont de losse omvormer standaard voor EUR 139. De exacte
-- variant 47143119290623 toont SolarFlow 800 met één AB2000L voor EUR 747.
-- Bron:
-- https://www.zendure.nl/products/solarflow-800?variant=47143119290623

update offers o
set
  price_cents = 74700,
  stock_status = 'in_stock',
  affiliate_url =
    'https://www.zendure.nl/products/solarflow-800?variant=47143119290623',
  affiliate_deeplink =
    'https://glp8.net/c/?si=20779&li=1881195&wi=423133&ws=&dl=products%2Fsolarflow-800%3Fvariant%3D47143119290623',
  affiliate_link_status = 'ok',
  affiliate_link_note =
    'Exacte SolarFlow 800 plus AB2000L-variant 47143119290623, EUR 747; gecheckt 2026-08-09T05:03:46Z',
  affiliate_link_checked_at = '2026-08-09T05:03:46Z'::timestamptz,
  last_checked_at = '2026-08-09T05:03:46Z'::timestamptz,
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'zendure-solarflow-800'
  and m.slug = 'zendure'
  and o.deleted_at is null;
