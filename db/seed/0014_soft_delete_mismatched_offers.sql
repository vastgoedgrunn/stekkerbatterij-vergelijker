-- P0: soft-delete offers met verkeerde merchant-SKU of dode outbound-URL.
-- Eerste set live toegepast 2026-07-15. Idempotent voor lokale seeds.
-- Nieuwe defecten gecontroleerd 2026-07-15T21:50:00Z.

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
    when p.slug = 'anker-solix-solarbank-2-e1600' and m.slug = 'coolblue'
      then 'P0 dead link: coolblue.nl/product/904321 geeft 404, gecontroleerd 2026-07-15T21:50:00Z'
    when p.slug = 'homewizard-plug-in-battery' and m.slug = 'coolblue'
      then 'P0 dead link: coolblue.nl/product/905678 geeft 404, gecontroleerd 2026-07-15T21:50:00Z'
    when p.slug = 'marstek-venus-512' and m.slug = 'zonneplan'
      then 'P0 dead link: zonneplan.nl/thuisbatterij/marstek-venus geeft 404, gecontroleerd 2026-07-15T21:50:00Z'
    when p.slug in ('sessy-thuisbatterij', 'sessy-thuisbatterij-duo') and m.slug = 'zonneplan'
      then 'P0 dead link: zonneplan.nl/thuisbatterij/sessy geeft 404, gecontroleerd 2026-07-15T21:50:00Z'
    when m.slug = 'solar-sale'
      then 'P0 TLS fout: certificaat dekt solarsale.nl niet, gecontroleerd 2026-07-15T21:50:00Z'
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
    or (p.slug = 'anker-solix-solarbank-2-e1600' and m.slug = 'coolblue')
    or (p.slug = 'homewizard-plug-in-battery' and m.slug = 'coolblue')
    or (p.slug = 'marstek-venus-512' and m.slug = 'zonneplan')
    or (p.slug in ('sessy-thuisbatterij', 'sessy-thuisbatterij-duo') and m.slug = 'zonneplan')
    or m.slug = 'solar-sale'
  );
