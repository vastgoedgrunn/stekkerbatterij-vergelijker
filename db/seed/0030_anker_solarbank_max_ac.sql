-- Anker SOLIX Solarbank Max AC als published plug-in met Bol partner-offer.
-- Bron prijs/foto: Bol Marketing Catalog API
--   GET /products/0194644338664?country-code=NL&include-offer=true&include-image=true
--   Gecontroleerd: 2026-07-20 → €2199,00 · bolProductId 9300000292343906
-- Specs: Anker SOLIX productpagina + Catalog-titel (7 kWh, ~3,5 kW, 10.000 cycli).

insert into products (
  brand_id, name, slug, summary, description, status, product_type,
  capacity_kwh, power_kw, cycles, warranty_years, expandable, image_path,
  ean, indicative_price_min_cents, published_at
)
select
  b.id,
  'Anker SOLIX Solarbank Max AC',
  'anker-solix-solarbank-max-ac',
  'Krachtigste plug-in thuisbatterij in ons overzicht: 7 kWh opslag, 3,5 kW vermogen, uitbreidbaar tot 42 kWh.',
  'De Anker SOLIX Solarbank Max AC is een all-in-one plug-and-play thuisbatterij met 7 kWh basiscapaciteit en tot 3,5 kW bidirectioneel vermogen. Geschikt voor bestaande zonnepanelen, uitbreidbaar tot 42 kWh met BP7000-modules, IP66 en 10 jaar garantie. Boven ongeveer 800 W advies: eigen groep of installateur.',
  'published',
  'plug_in'::product_type,
  7.0,
  3.5,
  10000,
  10,
  true,
  '/images/products/anker-solix-solarbank-max-ac.jpg',
  '0194644338664',
  219900,
  now()
from brands b
where b.slug = 'anker-solix'
on conflict (slug) do update set
  brand_id = excluded.brand_id,
  name = excluded.name,
  summary = excluded.summary,
  description = excluded.description,
  status = 'published',
  product_type = 'plug_in',
  capacity_kwh = excluded.capacity_kwh,
  power_kw = excluded.power_kw,
  cycles = excluded.cycles,
  warranty_years = excluded.warranty_years,
  expandable = excluded.expandable,
  image_path = excluded.image_path,
  ean = excluded.ean,
  indicative_price_min_cents = excluded.indicative_price_min_cents,
  published_at = coalesce(products.published_at, now()),
  deleted_at = null,
  updated_at = now();

insert into product_categories (product_id, category_id)
select p.id, c.id
from products p
cross join categories c
where p.slug = 'anker-solix-solarbank-max-ac'
  and c.slug in ('thuisbatterijen', 'uitbreidbaar', 'dynamisch-contract')
on conflict do nothing;

insert into product_specs (product_id, spec_id, value_number, value_boolean, value_text)
select p.id, sd.id, v.value_number, v.value_boolean, v.value_text
from (values
  ('anker-solix-solarbank-max-ac', 'ip_rating', null::numeric, null::boolean, 'IP66'),
  ('anker-solix-solarbank-max-ac', 'inverter_w', 3500::numeric, null::boolean, null::text),
  ('anker-solix-solarbank-max-ac', 'chemistry', null::numeric, null::boolean, 'LiFePO4'),
  ('anker-solix-solarbank-max-ac', 'installation', null::numeric, null::boolean, 'Plug & play (boven 800 W: eigen groep)')
) as v(product_slug, spec_key, value_number, value_boolean, value_text)
join products p on p.slug = v.product_slug
join spec_definitions sd on sd.key = v.spec_key
on conflict (product_id, spec_id) do update set
  value_number = excluded.value_number,
  value_boolean = excluded.value_boolean,
  value_text = excluded.value_text;

-- Merkscore (citeerbaar): zelfde Anker SOLIX Trustpilot-bron als E1600.
update products
set
  market_score_average = 4.1,
  market_score_count = 215,
  market_score_source_name = 'Trustpilot',
  market_score_source_url = 'https://www.trustpilot.com/review/ankersolix.com',
  market_score_scope = 'brand',
  market_score_checked_at = now(),
  updated_at = now()
where slug = 'anker-solix-solarbank-max-ac';

insert into offers (
  product_id, merchant_id, price_cents, currency, stock_status, delivery_days,
  is_sponsored, affiliate_url, affiliate_deeplink, affiliate_network,
  affiliate_link_status, affiliate_link_note, last_checked_at
)
select
  p.id,
  m.id,
  219900,
  'EUR',
  'in_stock',
  2,
  false,
  'https://www.bol.com/nl/nl/p/anker-solix-solarbank-max-ac-balkonkrachtwerk-met-opslag-7kwh-3600w-alles-in-1-plug-play-thuisaccu-10000-cycli-5-min-installatie-zonnepaneel-met-omvormer/9300000292343906/',
  'https://partner.bol.com/click/click?p=2&t=url&s=1532194&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fp%2Fanker-solix-solarbank-max-ac-balkonkrachtwerk-met-opslag-7kwh-3600w-alles-in-1-plug-play-thuisaccu-10000-cycli-5-min-installatie-zonnepaneel-met-omvormer%2F9300000292343906%2F',
  'bol-partner',
  'ok',
  'Bol Marketing Catalog EAN 0194644338664, EUR 2199, gecheckt 2026-07-20',
  now()
from products p
join merchants m on m.slug = 'bol'
where p.slug = 'anker-solix-solarbank-max-ac'
  and not exists (
    select 1 from offers o
    where o.product_id = p.id and o.merchant_id = m.id and o.deleted_at is null
  );

-- Als offer al bestond: prijs + deeplink verversen.
update offers o
set
  price_cents = 219900,
  stock_status = 'in_stock',
  affiliate_url = 'https://www.bol.com/nl/nl/p/anker-solix-solarbank-max-ac-balkonkrachtwerk-met-opslag-7kwh-3600w-alles-in-1-plug-play-thuisaccu-10000-cycli-5-min-installatie-zonnepaneel-met-omvormer/9300000292343906/',
  affiliate_deeplink = 'https://partner.bol.com/click/click?p=2&t=url&s=1532194&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fp%2Fanker-solix-solarbank-max-ac-balkonkrachtwerk-met-opslag-7kwh-3600w-alles-in-1-plug-play-thuisaccu-10000-cycli-5-min-installatie-zonnepaneel-met-omvormer%2F9300000292343906%2F',
  affiliate_network = 'bol-partner',
  affiliate_link_status = 'ok',
  affiliate_link_note = 'Bol Marketing Catalog EAN 0194644338664, EUR 2199, gecheckt 2026-07-20',
  last_checked_at = now(),
  updated_at = now(),
  deleted_at = null
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'anker-solix-solarbank-max-ac'
  and m.slug = 'bol'
  and o.deleted_at is null;

insert into price_history (offer_id, price_cents, recorded_at)
select o.id, o.price_cents, now()
from offers o
join products p on p.id = o.product_id
join merchants m on m.id = o.merchant_id
where p.slug = 'anker-solix-solarbank-max-ac'
  and m.slug = 'bol'
  and o.deleted_at is null
  and not exists (
    select 1 from price_history ph
    where ph.offer_id = o.id and ph.price_cents = o.price_cents
      and ph.recorded_at > now() - interval '1 day'
  );
