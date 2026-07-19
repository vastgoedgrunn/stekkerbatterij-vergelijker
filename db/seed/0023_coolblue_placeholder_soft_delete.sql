-- P0: Coolblue seed-placeholders soft-deleten (verkeerde product-IDs).
-- homewizard coolblue.nl/product/905678 → Apple Watch (gemeld 2026-07-19)
-- anker coolblue.nl/product/904321 → seed-placeholder, niet geverifieerd

update offers o
set
  deleted_at = coalesce(o.deleted_at, now()),
  affiliate_link_status = 'broken',
  affiliate_link_note = case p.slug
    when 'homewizard-plug-in-battery'
      then 'P0 SKU mismatch: coolblue.nl/product/905678 is geen HomeWizard Plug-In Battery (Apple Watch); soft-deleted'
    when 'anker-solix-solarbank-2-e1600'
      then 'P0: coolblue.nl/product/904321 is seed-placeholder; soft-deleted tot geverifieerde product-URL'
    else coalesce(o.affiliate_link_note, 'P0: Coolblue placeholder soft-deleted')
  end,
  affiliate_link_checked_at = now(),
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and m.slug = 'coolblue'
  and p.slug in ('homewizard-plug-in-battery', 'anker-solix-solarbank-2-e1600')
  and (
    o.affiliate_url ~* 'coolblue\\.nl/product/(905678|904321)'
    or o.affiliate_deeplink ~* 'coolblue\\.nl/product/(905678|904321)'
  );
