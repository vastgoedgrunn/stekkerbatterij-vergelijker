-- Bol Marketing Catalog prijsprijzen (2026-07-19)
-- Bron: GET /marketing/catalog/v1/products/{ean}?country-code=NL&include-offer=true
-- Wacht op Slack ✅ via verification gate voordat dit op productie wordt uitgevoerd.

-- Anker SOLIX Solarbank 2 E1600 Pro: €799 → €699 (−12,5%)
update offers o
set
  price_cents = 69900,
  stock_status = 'in_stock',
  last_checked_at = now(),
  affiliate_link_note = 'Bol Catalog prijs 2026-07-19 (€699)',
  updated_at = now()
from products p
join merchants m on m.id = o.merchant_id
where o.product_id = p.id
  and p.slug = 'anker-solix-solarbank-2-e1600-pro'
  and m.slug = 'bol'
  and o.deleted_at is null;

-- EcoFlow STREAM AC Pro: €1099 → €698 (−36,5%)
update offers o
set
  price_cents = 69800,
  stock_status = 'in_stock',
  last_checked_at = now(),
  affiliate_link_note = 'Bol Catalog prijs 2026-07-19 (€698)',
  updated_at = now()
from products p
join merchants m on m.id = o.merchant_id
where o.product_id = p.id
  and p.slug = 'ecoflow-stream-ac-pro'
  and m.slug = 'bol'
  and o.deleted_at is null;

-- Zendure Hyper 2000: Catalog product bestaat, maar geen best offer (geen voorraad)
update offers o
set
  stock_status = 'out_of_stock',
  last_checked_at = now(),
  affiliate_link_note = 'Bol Catalog 2026-07-19: product OK, geen best offer (geen voorraad)',
  updated_at = now()
from products p
join merchants m on m.id = o.merchant_id
where o.product_id = p.id
  and p.slug = 'zendure-solarflow-hyper-2000'
  and m.slug = 'bol'
  and o.deleted_at is null;
