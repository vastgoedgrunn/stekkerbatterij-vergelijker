-- =========================================================================
-- 0027_homewizard_daisycon_live.sql
-- HomeWizard INT Daisycon live: li=1795784, media wi=423133, si=18407.
-- Tracking-host: partner.homewizard.com (adverteerder-specifiek).
-- Outbound geverifieerd 2026-07-20:
--   partner.homewizard.com → www.homewizard.com/nl/plug-in-battery/
--   partner.homewizard.com → www.homewizard.com/nl/shop/plug-in-battery/
-- =========================================================================

update partner_programs
set link_id = '1795784', updated_at = now()
where slug = 'homewizard-int';

-- Single: productpagina
update offers o
set
  affiliate_url = 'https://www.homewizard.com/nl/plug-in-battery/',
  affiliate_deeplink = 'https://partner.homewizard.com/c/?si=18407&li=1795784&wi=423133&ws=&dl=nl%2Fplug-in-battery%2F',
  affiliate_network = 'daisycon',
  affiliate_params = '{"ws":"{click_ref}"}'::jsonb,
  commission_type = 'cps',
  commission_rate = 0.075,
  commission_source_url = 'https://affiliate-net.nl/programmas/homewizard/',
  affiliate_link_status = 'ok',
  affiliate_link_checked_at = now(),
  affiliate_link_note = 'Daisycon HomeWizard INT li=1795784 wi=423133; redirect OK naar plug-in-battery',
  last_checked_at = now(),
  deleted_at = null
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'homewizard-plug-in-battery'
  and m.slug = 'homewizard';

-- Bundle: shoppagina (enige officiële URL die we hebben)
update offers o
set
  affiliate_url = 'https://www.homewizard.com/nl/shop/plug-in-battery/',
  affiliate_deeplink = 'https://partner.homewizard.com/c/?si=18407&li=1795784&wi=423133&ws=&dl=nl%2Fshop%2Fplug-in-battery%2F',
  affiliate_network = 'daisycon',
  affiliate_params = '{"ws":"{click_ref}"}'::jsonb,
  commission_type = 'cps',
  commission_rate = 0.075,
  commission_source_url = 'https://affiliate-net.nl/programmas/homewizard/',
  affiliate_link_status = 'ok',
  affiliate_link_checked_at = now(),
  affiliate_link_note = 'Daisycon HomeWizard INT li=1795784 wi=423133; redirect OK naar shop/plug-in-battery',
  last_checked_at = now(),
  deleted_at = null
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'homewizard-plug-in-battery-bundle'
  and m.slug = 'homewizard';
