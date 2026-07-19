-- Extra outbound voor catalogus-gaten (officiële merchant product-URL's).
-- HomeWizard Bundle: zelfde webshop als single (losse units stapelen).
-- Prijs = 2 × live single-unit prijs (1195 × 2), bron HomeWizard shop 2026-07-19.

insert into offers (
  product_id, merchant_id, price_cents, stock_status, delivery_days,
  is_sponsored, affiliate_url, affiliate_link_status, last_checked_at
)
select
  p.id,
  m.id,
  239000,
  'in_stock',
  14,
  false,
  'https://www.homewizard.com/nl/shop/plug-in-battery/',
  'pending',
  now()
from products p
cross join merchants m
where p.slug = 'homewizard-plug-in-battery-bundle'
  and m.slug = 'homewizard'
  and p.deleted_at is null
  and not exists (
    select 1 from offers o
    where o.product_id = p.id
      and o.merchant_id = m.id
      and o.deleted_at is null
  );

-- Sessy Duo: officieel productpad (bestel 2× Sessy via productpagina).
insert into offers (
  product_id, merchant_id, price_cents, stock_status, delivery_days,
  is_sponsored, affiliate_url, affiliate_link_status, last_checked_at
)
select
  p.id,
  m.id,
  710000,
  'in_stock',
  21,
  false,
  'https://www.sessy.nl/product/sessy/',
  'pending',
  now()
from products p
cross join merchants m
where p.slug = 'sessy-thuisbatterij-duo'
  and m.slug = 'sessy'
  and p.deleted_at is null
  and not exists (
    select 1 from offers o
    where o.product_id = p.id
      and o.merchant_id = m.id
      and o.deleted_at is null
  );
