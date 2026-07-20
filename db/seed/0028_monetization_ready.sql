-- Monetization hygiene terwijl Awin/Daisycon-energie/e-WNDR-goedkeuringen binnenkomen.
-- Geen nieuwe publisher-IDs vereist. P0: zoek/listing/homepages soft-deleten.
-- Sessy/Sunology merchants + officiële product-URL's (direct, onbetaald tot er een programma is).

-- Merchants voor directe merkshops
insert into merchants (name, slug, is_self, website_url, default_affiliate_network) values
  ('Sessy', 'sessy', false, 'https://www.sessy.nl', null),
  ('Sunology', 'sunology', false, 'https://sunology.eu', null),
  ('EcoFlow', 'ecoflow', false, 'https://nl.ecoflow.com', 'awin')
on conflict (slug) do update set
  name = excluded.name,
  website_url = excluded.website_url,
  default_affiliate_network = coalesce(excluded.default_affiliate_network, merchants.default_affiliate_network);

update merchants set
  deeplink_param_template = '{"clickref":"{click_ref}"}'::jsonb
where slug = 'ecoflow';

-- P0: Gamma assortiment + kale homepages
update offers o
set
  deleted_at = coalesce(o.deleted_at, now()),
  affiliate_link_status = 'broken',
  affiliate_link_note = 'P0: zoek/listing/homepage soft-deleted (monetization hygiene 2026-07-20)',
  affiliate_link_checked_at = now(),
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and o.deleted_at is null
  and (
    coalesce(o.affiliate_deeplink, o.affiliate_url) ~* 'gamma\\.nl/assortiment'
    or coalesce(o.affiliate_deeplink, o.affiliate_url) ~* '^https://(www\\.)?coolblue\\.nl/?$'
    or coalesce(o.affiliate_deeplink, o.affiliate_url) ~* '^https://(www\\.)?gamma\\.nl/?$'
    or coalesce(o.affiliate_deeplink, o.affiliate_url) ~* '^https://(www\\.)?bol\\.com/?$'
    or coalesce(o.affiliate_deeplink, o.affiliate_url) ~* '^https://(www\\.)?bol\\.com/nl/?$'
  );

-- Sessy single: officiële productpagina (direct, onbetaald)
insert into offers (
  product_id, merchant_id, price_cents, stock_status, delivery_days,
  is_sponsored, affiliate_url, affiliate_network, affiliate_link_status,
  affiliate_link_note, last_checked_at
)
select
  p.id, m.id, 355000, 'in_stock', 21, false,
  'https://www.sessy.nl/product/sessy/',
  null,
  'ok',
  'Direct merkshop (geen affiliateprogramma bekend); product-URL geverifieerd',
  now()
from products p
cross join merchants m
where p.slug = 'sessy-thuisbatterij'
  and m.slug = 'sessy'
  and p.deleted_at is null
on conflict (product_id, merchant_id) do update set
  affiliate_url = excluded.affiliate_url,
  affiliate_link_status = excluded.affiliate_link_status,
  affiliate_link_note = excluded.affiliate_link_note,
  deleted_at = null,
  last_checked_at = now(),
  updated_at = now();

-- Sessy Duo
insert into offers (
  product_id, merchant_id, price_cents, stock_status, delivery_days,
  is_sponsored, affiliate_url, affiliate_network, affiliate_link_status,
  affiliate_link_note, last_checked_at
)
select
  p.id, m.id, 710000, 'in_stock', 21, false,
  'https://www.sessy.nl/product/sessy/',
  null,
  'ok',
  'Direct merkshop (2× Sessy via productpagina); geen affiliateprogramma',
  now()
from products p
cross join merchants m
where p.slug = 'sessy-thuisbatterij-duo'
  and m.slug = 'sessy'
  and p.deleted_at is null
on conflict (product_id, merchant_id) do update set
  affiliate_url = excluded.affiliate_url,
  price_cents = excluded.price_cents,
  affiliate_link_status = excluded.affiliate_link_status,
  affiliate_link_note = excluded.affiliate_link_note,
  deleted_at = null,
  last_checked_at = now(),
  updated_at = now();

-- Sunology Play / Storey
insert into offers (
  product_id, merchant_id, price_cents, stock_status, delivery_days,
  is_sponsored, affiliate_url, affiliate_network, affiliate_link_status,
  affiliate_link_note, last_checked_at
)
select
  p.id, m.id, v.price_cents, 'in_stock', 14, false,
  v.url, null, 'ok',
  'Direct merkshop (sunology.eu); geen affiliateprogramma bekend',
  now()
from (values
  ('sunology-play', 129900, 'https://sunology.eu/products/sunology-play'),
  ('sunology-storey', 249900, 'https://sunology.eu/products/storey-batterie-stockage-plug-play')
) as v(pslug, price_cents, url)
join products p on p.slug = v.pslug and p.deleted_at is null
cross join merchants m
where m.slug = 'sunology'
on conflict (product_id, merchant_id) do update set
  affiliate_url = excluded.affiliate_url,
  price_cents = excluded.price_cents,
  affiliate_link_status = excluded.affiliate_link_status,
  affiliate_link_note = excluded.affiliate_link_note,
  deleted_at = null,
  last_checked_at = now(),
  updated_at = now();

-- EcoFlow STREAM: merkshop-URL klaarzetten (pending tot AWIN_PUBLISHER_ID + goedkeuring)
insert into offers (
  product_id, merchant_id, price_cents, stock_status, delivery_days,
  is_sponsored, affiliate_url, affiliate_network, affiliate_link_status,
  affiliate_link_note, affiliate_params, last_checked_at
)
select
  p.id, m.id,
  coalesce((
    select o2.price_cents from offers o2
    join merchants mb on mb.id = o2.merchant_id
    where o2.product_id = p.id and mb.slug = 'bol' and o2.deleted_at is null
    limit 1
  ), 69800),
  'in_stock', 7, false,
  'https://nl.ecoflow.com/',
  'awin',
  'pending',
  'EcoFlow NL Awin mid=123332 klaar; zet AWIN_PUBLISHER_ID na goedkeuring + product-deeplink',
  '{"clickref":"{click_ref}"}'::jsonb,
  now()
from products p
cross join merchants m
where p.slug = 'ecoflow-stream-ac-pro'
  and m.slug = 'ecoflow'
  and p.deleted_at is null
on conflict (product_id, merchant_id) do update set
  affiliate_url = excluded.affiliate_url,
  affiliate_network = excluded.affiliate_network,
  affiliate_link_status = case
    when offers.affiliate_link_status = 'ok' then offers.affiliate_link_status
    else excluded.affiliate_link_status
  end,
  affiliate_link_note = excluded.affiliate_link_note,
  affiliate_params = excluded.affiliate_params,
  deleted_at = null,
  last_checked_at = now(),
  updated_at = now();

-- Partner programs: bekende IDs + EcoFlow Awin scaffolding
update partner_programs
set program_id = '1532194', updated_at = now()
where slug = 'bol-partner' and (program_id is null or program_id = '');

insert into partner_programs (
  slug, name, network, program_id, link_id, commission_type, commission_rate,
  cookie_days, signup_url, source_url
) values (
  'ecoflow-nl-awin',
  'EcoFlow NL (Awin)',
  'awin',
  '123332',
  null,
  'cps',
  0.05,
  7,
  'https://ui.awin.com/merchant-profile/123332',
  'https://ui.awin.com/merchant-profile/123332'
)
on conflict (slug) do update set
  program_id = excluded.program_id,
  commission_rate = excluded.commission_rate,
  signup_url = excluded.signup_url,
  source_url = excluded.source_url,
  updated_at = now();

insert into partner_programs (
  slug, name, network, program_id, link_id, commission_type, commission_rate,
  cookie_days, signup_url, source_url
) values
  ('coolblue-nl-awin', 'Coolblue NL (Awin)', 'awin', '85161', null, 'cps', null, 28,
   'https://ui.awin.com/merchant-profile/85161', 'https://www.coolblue.nl/affiliate'),
  ('coolblue-energie-awin', 'Coolblue Energie NL (Awin)', 'awin', '85163', null, 'cpa', null, 30,
   'https://ui.awin.com/merchant-profile/85163', 'https://www.coolblue.nl/energie')
on conflict (slug) do update set
  program_id = excluded.program_id,
  signup_url = excluded.signup_url,
  source_url = excluded.source_url,
  updated_at = now();

-- Energie placeholders expliciet inactief tot Daisycon-campagne-IDs binnen zijn
update energy_partners
set active = false, updated_at = now()
where slug in ('frank-energie', 'vattenfall-flex')
  and (
    affiliate_url ilike '%FRANK_PLACEHOLDER%'
    or affiliate_url ilike '%VATTENFALL_PLACEHOLDER%'
  );

-- Zonneplan Sessy/Marstek: claim Daisycon zonder geverifieerde campagne → pending/broken
update offers o
set
  affiliate_link_status = 'pending',
  affiliate_link_note = 'Zonneplan-URL zonder geverifieerde Daisycon-campagne; wacht op program_id',
  affiliate_link_checked_at = now(),
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and o.deleted_at is null
  and m.slug = 'zonneplan'
  and o.affiliate_network = 'daisycon'
  and o.affiliate_link_status = 'ok';
