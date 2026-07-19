-- =========================================================================
-- 0020_offer_freshness_and_broken_cleanup.sql
-- Markeer dode outbound + refresh last_checked voor geverifieerde URLs.
-- Merchant density (2+ shops per top-SKU) volgt Data-agent met echte affiliate-URLs.
-- =========================================================================

update offers o
set
  affiliate_link_status = 'broken',
  updated_at = now()
from products p
where o.product_id = p.id
  and p.slug = 'marstek-venus-512'
  and o.affiliate_url ilike '%zonneplan.nl%'
  and o.deleted_at is null;

-- Verse check-timestamp na HTTP 200 op destination (2026-07-19).
update offers o
set
  last_checked_at = now(),
  updated_at = now()
from products p
where o.product_id = p.id
  and p.slug in (
    'anker-solix-solarbank-2-e1600-pro',
    'ecoflow-stream-ac-pro',
    'zendure-solarflow-800',
    'zendure-solarflow-hyper-2000'
  )
  and o.deleted_at is null
  and o.affiliate_link_status = 'ok';
