-- =========================================================================
-- 0018_zendure_daisycon_live.sql
-- Zendure NL Daisycon live: link_id + officiele shop-offer met glp8-deeplink.
-- Prijs: SolarFlow 800 + AB2000L (1,92 kWh) = €747 (zendure.nl, 2026-07-19).
-- Outbound geverifieerd: glp8.net → https://www.zendure.nl/products/solarflow-800
-- =========================================================================

update partner_programs
set link_id = '1881195', updated_at = now()
where slug = 'zendure-nl';

insert into offers (
  product_id, merchant_id, price_cents, stock_status, delivery_days, is_sponsored,
  affiliate_url, affiliate_deeplink, affiliate_network, affiliate_params,
  commission_type, commission_rate, commission_source_url,
  affiliate_link_status, affiliate_link_checked_at, affiliate_link_note, last_checked_at
)
select
  p.id,
  m.id,
  74700,
  'in_stock',
  3,
  false,
  'https://www.zendure.nl/products/solarflow-800',
  'https://glp8.net/c/?si=20779&li=1881195&wi=423133&ws=&dl=products%2Fsolarflow-800',
  'daisycon',
  '{"ws":"{click_ref}"}'::jsonb,
  'cps',
  0.08,
  'https://www.zendure.nl/pages/affiliate-program',
  'ok',
  now(),
  'Daisycon li=1881195 wi=423133; redirect OK naar SolarFlow 800',
  now()
from products p
join merchants m on m.slug = 'zendure'
where p.slug = 'zendure-solarflow-800'
on conflict (product_id, merchant_id) do update set
  price_cents = excluded.price_cents,
  stock_status = excluded.stock_status,
  delivery_days = excluded.delivery_days,
  affiliate_url = excluded.affiliate_url,
  affiliate_deeplink = excluded.affiliate_deeplink,
  affiliate_network = excluded.affiliate_network,
  affiliate_params = excluded.affiliate_params,
  commission_type = excluded.commission_type,
  commission_rate = excluded.commission_rate,
  commission_source_url = excluded.commission_source_url,
  affiliate_link_status = excluded.affiliate_link_status,
  affiliate_link_checked_at = excluded.affiliate_link_checked_at,
  affiliate_link_note = excluded.affiliate_link_note,
  last_checked_at = excluded.last_checked_at,
  deleted_at = null;

insert into price_history (offer_id, price_cents, recorded_at)
select o.id, o.price_cents, now()
from offers o
join products p on p.id = o.product_id
join merchants m on m.id = o.merchant_id
where p.slug = 'zendure-solarflow-800' and m.slug = 'zendure'
  and not exists (
    select 1 from price_history ph
    where ph.offer_id = o.id and ph.price_cents = o.price_cents
      and ph.recorded_at > now() - interval '1 day'
  );
