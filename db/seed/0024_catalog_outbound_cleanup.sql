-- =========================================================================
-- 0024_catalog_outbound_cleanup.sql
-- P0 catalog opschoning (2026-07-19): alleen geverifieerde product-outbounds.
-- =========================================================================

-- Merchants voor officiële merkwinkels (geen CTA zonder echte product-URL)
insert into merchants (name, slug, website_url, is_self)
values
  ('Sessy', 'sessy', 'https://www.sessy.nl', false),
  ('Sunology', 'sunology', 'https://sunology.eu', false),
  ('Marstek', 'marstek', 'https://eu.marstekenergy.com', false)
on conflict (slug) do update set
  website_url = excluded.website_url,
  deleted_at = null;

-- 1) Soft-delete actieve offers die niet kloppen / dood zijn
update offers o
set
  deleted_at = coalesce(o.deleted_at, now()),
  affiliate_link_status = 'broken',
  affiliate_link_note = case
    when m.slug = 'solar-sale'
      then 'P0: Solar Sale product-URL onbereikbaar/niet geverifieerd; soft-deleted 2026-07-19'
    when m.slug = 'zonneplan' and p.slug = 'marstek-venus-512'
      then 'P0: zonneplan.nl/thuisbatterij/marstek-venus geeft 404; soft-deleted'
    when m.slug = 'bol' and p.slug = 'zendure-solarflow-hyper-2000'
      then 'P0: Bol product OK maar geen best offer (geen voorraad); outbound gestopt'
    else coalesce(o.affiliate_link_note, 'P0 outbound soft-deleted')
  end,
  affiliate_link_checked_at = now(),
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and o.deleted_at is null
  and (
    m.slug = 'solar-sale'
    or (m.slug = 'zonneplan' and p.slug = 'marstek-venus-512')
    or (m.slug = 'bol' and p.slug = 'zendure-solarflow-hyper-2000')
  );

-- 2) Marstek Venus 5.12kWh × Bol (Venus E 3.0, titel+capaciteit match)
insert into offers (
  product_id, merchant_id, price_cents, stock_status, delivery_days, is_sponsored,
  affiliate_url, affiliate_deeplink, affiliate_network,
  commission_type, commission_rate, commission_source_url,
  affiliate_link_status, affiliate_link_checked_at, affiliate_link_note, last_checked_at
)
select
  p.id, m.id, 130000, 'in_stock', 5, false,
  'https://www.bol.com/nl/nl/p/marstek-venus-e-3-0-5-12kwh-plug-play-thuisbatterij-via-230v-stopcontact/9300000240523865/',
  'https://partner.bol.com/click/click?p=2&t=url&s=1532194&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fp%2Fmarstek-venus-e-3-0-5-12kwh-plug-play-thuisbatterij-via-230v-stopcontact%2F9300000240523865%2F',
  'bol-partner',
  'cps', 0.025, 'https://affiliate.bol.com/',
  'ok', now(),
  'Bol Catalog 2026-07-19: Marstek Venus E 3.0 5,12kWh (pid 9300000240523865) titelmatch',
  now()
from products p
join merchants m on m.slug = 'bol'
where p.slug = 'marstek-venus-512'
on conflict (product_id, merchant_id) do update set
  price_cents = excluded.price_cents,
  stock_status = excluded.stock_status,
  affiliate_url = excluded.affiliate_url,
  affiliate_deeplink = excluded.affiliate_deeplink,
  affiliate_network = excluded.affiliate_network,
  affiliate_link_status = 'ok',
  affiliate_link_note = excluded.affiliate_link_note,
  affiliate_link_checked_at = now(),
  last_checked_at = now(),
  deleted_at = null,
  updated_at = now();

-- 3) HomeWizard officiële shop (Daisycon li ontbreekt nog; wel correcte product-URL)
insert into offers (
  product_id, merchant_id, price_cents, stock_status, delivery_days, is_sponsored,
  affiliate_url, affiliate_deeplink, affiliate_network,
  commission_type, commission_rate, commission_source_url,
  affiliate_link_status, affiliate_link_checked_at, affiliate_link_note, last_checked_at
)
select
  p.id, m.id, 119500, 'in_stock', 7, false,
  'https://www.homewizard.com/nl/plug-in-battery/',
  null,
  null,
  'cps', 0.075, 'https://affiliate-net.nl/programmas/homewizard/',
  'ok', now(),
  'Officiële HomeWizard productpagina 2026-07-19 (€1195); Daisycon li volgt',
  now()
from products p
join merchants m on m.slug = 'homewizard'
where p.slug = 'homewizard-plug-in-battery'
on conflict (product_id, merchant_id) do update set
  price_cents = excluded.price_cents,
  stock_status = excluded.stock_status,
  affiliate_url = excluded.affiliate_url,
  affiliate_deeplink = excluded.affiliate_deeplink,
  affiliate_link_status = 'ok',
  affiliate_link_note = excluded.affiliate_link_note,
  affiliate_link_checked_at = now(),
  last_checked_at = now(),
  deleted_at = null,
  updated_at = now();

-- 4) Sessy officiële productpagina
insert into offers (
  product_id, merchant_id, price_cents, stock_status, delivery_days, is_sponsored,
  affiliate_url, affiliate_deeplink, affiliate_network,
  affiliate_link_status, affiliate_link_checked_at, affiliate_link_note, last_checked_at
)
select
  p.id, m.id, 355000, 'in_stock', 14, false,
  'https://www.sessy.nl/product/sessy/',
  null, null,
  'ok', now(),
  'Officiële Sessy productpagina 2026-07-19 (vanaf €3550 op sessy.nl)',
  now()
from products p
join merchants m on m.slug = 'sessy'
where p.slug = 'sessy-thuisbatterij'
on conflict (product_id, merchant_id) do update set
  price_cents = excluded.price_cents,
  affiliate_url = excluded.affiliate_url,
  affiliate_link_status = 'ok',
  affiliate_link_note = excluded.affiliate_link_note,
  affiliate_link_checked_at = now(),
  last_checked_at = now(),
  deleted_at = null,
  updated_at = now();

-- 5) Sunology PLAY + Storey (officiële EU-shop)
insert into offers (
  product_id, merchant_id, price_cents, stock_status, delivery_days, is_sponsored,
  affiliate_url, affiliate_deeplink, affiliate_network,
  affiliate_link_status, affiliate_link_checked_at, affiliate_link_note, last_checked_at
)
select
  p.id, m.id, v.price_cents, 'in_stock', 10, false,
  v.url, null, null,
  'ok', now(), v.note, now()
from (values
  ('sunology-play', 59900,
   'https://sunology.eu/products/sunology-play',
   'Officiële Sunology PLAY pagina 2026-07-19 (€599)'),
  ('sunology-storey', 139000,
   'https://sunology.eu/products/storey-batterie-stockage-plug-play',
   'Officiële Sunology STOREY pagina 2026-07-19 (€1390)')
) as v(pslug, price_cents, url, note)
join products p on p.slug = v.pslug
join merchants m on m.slug = 'sunology'
on conflict (product_id, merchant_id) do update set
  price_cents = excluded.price_cents,
  affiliate_url = excluded.affiliate_url,
  affiliate_link_status = 'ok',
  affiliate_link_note = excluded.affiliate_link_note,
  affiliate_link_checked_at = now(),
  last_checked_at = now(),
  deleted_at = null,
  updated_at = now();

-- 6) Bevestig bestaande goede Bol-offers (Anker Pro, EcoFlow STREAM, Zendure 800 Daisycon)
update offers o
set
  affiliate_link_checked_at = now(),
  last_checked_at = now(),
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and o.deleted_at is null
  and o.affiliate_link_status = 'ok'
  and (
    (p.slug = 'anker-solix-solarbank-2-e1600-pro' and m.slug = 'bol')
    or (p.slug = 'ecoflow-stream-ac-pro' and m.slug = 'bol')
    or (p.slug = 'zendure-solarflow-800' and m.slug = 'zendure')
  );
