-- Sunology PLAY is een zonnestation en geen stekkerbatterij.
-- Bron gecontroleerd op 2026-08-01T06:03:38Z:
-- https://sunology.eu/products/sunology-play
-- Publicatie en outbound blijven uit tot een harde batterij-SKU beschikbaar is.

update offers o
set
  deleted_at = coalesce(o.deleted_at, '2026-08-01T06:03:38Z'::timestamptz),
  affiliate_link_status = 'broken',
  affiliate_link_note = 'P0: Sunology PLAY productpagina is een zonnestation, geen batterij-SKU; soft-deleted 2026-08-01',
  affiliate_link_checked_at = '2026-08-01T06:03:38Z'::timestamptz,
  last_checked_at = '2026-08-01T06:03:38Z'::timestamptz,
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'sunology-play'
  and m.slug = 'sunology';

update products
set
  status = 'draft',
  published_at = null,
  updated_at = now()
where slug = 'sunology-play'
  and deleted_at is null;
