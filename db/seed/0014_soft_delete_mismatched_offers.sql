-- P0: soft-delete offers met verkeerde merchant-SKU of dode outbound-URL.
-- Live al toegepast 2026-07-15. Idempotent voor lokale seeds.

update offers o
set
  deleted_at = coalesce(o.deleted_at, now()),
  affiliate_link_status = 'broken',
  affiliate_link_checked_at = now(),
  affiliate_link_note = case
    when p.slug = 'zendure-solarflow-800' and m.slug = 'bol'
      then 'P0 SKU mismatch: deeplink wees naar AB3000X 2,88kWh i.p.v. SolarFlow 800'
    when p.slug = 'zendure-solarflow-800' and m.slug = 'coolblue'
      then 'P0 dead link: coolblue.nl/product/903456 geeft 404'
    when p.slug = 'ecoflow-powerstream-800' and m.slug = 'bol'
      then 'P0 SKU mismatch: deeplink wees naar STREAM AC Pro i.p.v. PowerStream 800'
    when p.slug = 'anker-solix-solarbank-2-e1600' and m.slug = 'bol'
      then 'P0 SKU mismatch: deeplink wees naar Solarbank 2 E1600 Pro i.p.v. E1600'
    else coalesce(o.affiliate_link_note, 'P0 outbound mismatch/dead')
  end,
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and (
    (p.slug = 'zendure-solarflow-800' and m.slug in ('bol', 'coolblue'))
    or (p.slug = 'ecoflow-powerstream-800' and m.slug = 'bol'
        and coalesce(o.affiliate_url, '') like '%ecoflow-stream-ac-pro%')
    or (p.slug = 'anker-solix-solarbank-2-e1600' and m.slug = 'bol'
        and coalesce(o.affiliate_url, '') like '%e1600-pro%')
  );
