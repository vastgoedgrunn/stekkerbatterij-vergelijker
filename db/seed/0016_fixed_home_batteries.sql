-- =========================================================================
-- 0016_fixed_home_batteries.sql — 8 vaste thuisbatterijen (lead/offerte-pad)
-- Geen affiliate offers. Indicatieve richtprijzen (incl. installatie, incl.
-- btw) zijn hercontroleerd op 2026-08-01 en gaan via de price-fact-verification
-- gate. Het blijven richtprijzen: de definitieve prijs is een offerte op maat.
--
-- Bandbreedtes per model (afgerond op honderden euro's), bron + checked-at:
--   tesla-powerwall-3                9.500 tot 13.000  solargarant.nl/thuisbatterijen/tesla-powerwall/powerwall-3/prijs/ (2026-08-01)
--   byd-battery-box-premium-hvs-10-2 7.000 tot  9.000  solargarant.nl/thuisbatterijen/byd/ (2026-08-01), incl. hybride omvormer
--   huawei-luna2000-10-s0            5.800 tot  8.500  solargarant.nl/thuisbatterijen/huawei/luna-2000-10-kwh/ (2026-08-01)
--   solaredge-home-battery-10        8.000 tot 10.000  thuisbatterij.nl/merken/solaredge/ (2026-08-01); ondergrens geldt bij
--                                                      btw-teruggave en bij bestaande geschikte SolarEdge omvormer
--   enphase-iq-battery-5p            5.000 tot  7.500  solargarant.nl/thuisbatterijen/enphase/prijs/ (2026-08-01)
--   sigenergy-sigenstor-10           7.000 tot 10.000  solargarant.nl/thuisbatterijen/sigenergy/ (2026-08-01), configuratie-afhankelijk
--   sonnen-eco-8                     9.000 tot 12.500  solargarant.nl/thuisbatterijen/sonnen/ (2026-08-01)
--   foxess-ecs-10-4                  7.000 tot  9.000  dx-installatietechniek.nl 10,4 kWh pakket (2026-08-01) + typische installatie
--
-- KANTTEKENING sonnen-eco-8: de eco 8 is uitgefaseerd en wordt in NL niet meer
-- los geprijsd. De bandbreedte dekt de actuele 10 kWh opvolgers (sonnenBatterie
-- Evo 10 kWh 9.000 tot 11.000 en 10 Performance 10 kWh 10.000 tot 12.500).
-- KANTTEKENING foxess-ecs-10-4: geen NL-bron met all-in prijs gevonden. Band is
-- afgeleid: hardware-pakket ca. 6.100 incl. btw plus installatie 800 tot 2.000.
-- =========================================================================

insert into categories (name, slug, description, sort_order) values
  (
    'Vaste thuisbatterijen',
    'vaste-thuisbatterijen',
    'Geïnstalleerde thuisbatterijen met installateur. Vergelijk specs en vraag een vrijblijvende offerte aan.',
    15
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into brands (name, slug, website_url) values
  ('Tesla', 'tesla', 'https://www.tesla.com/nl_nl/powerwall'),
  ('BYD', 'byd', 'https://www.byd.com'),
  ('Huawei', 'huawei', 'https://solar.huawei.com'),
  ('SolarEdge', 'solaredge', 'https://www.solaredge.com'),
  ('Enphase', 'enphase', 'https://enphase.com'),
  ('Sigenergy', 'sigenergy', 'https://www.sigenergy.com'),
  ('Sonnen', 'sonnen', 'https://sonnen.de'),
  ('FoxESS', 'foxess', 'https://www.fox-ess.com')
on conflict (slug) do update set name = excluded.name, website_url = excluded.website_url;

insert into products (
  brand_id, name, slug, summary, description, status,
  capacity_kwh, power_kw, cycles, warranty_years, expandable, image_path,
  product_type, indicative_price_min_cents, indicative_price_max_cents, published_at
)
select
  b.id, v.name, v.slug, v.summary, v.description, 'published',
  v.capacity, v.power, v.cycles, v.warranty, v.expandable, v.image_path,
  'fixed'::product_type, v.indicative_min_cents, v.indicative_max_cents, now()
from (values
  (
    'tesla',
    'Tesla Powerwall 3',
    'tesla-powerwall-3',
    'All-in-one thuisbatterij met geïntegreerde omvormer, populair bij huishoudens met zonnepanelen.',
    'De Tesla Powerwall 3 combineert batterij en hybride omvormer in één compacte unit. Geschikt voor zelfverbruik, backup en dynamische tarieven. Installatie door een gecertificeerde installateur is verplicht.',
    13.5, 11.5, 10000, 10, false,
    '/images/products/tesla-powerwall-3.jpg',
    950000::bigint, 1300000::bigint
  ),
  (
    'byd',
    'BYD Battery-Box Premium HVS 10.2',
    'byd-battery-box-premium-hvs-10-2',
    'Modulaire hoogspanningsbatterij, veelgebruikt door NL-installateurs.',
    'De BYD Battery-Box Premium HVS is een schaalbaar hoogspanningssysteem. Modules stapelen voor meer capaciteit. Geschikt in combinatie met gangbare hybride omvormers. Wandmontage door installateur.',
    10.2, 9.0, 6000, 10, true,
    '/images/products/byd-battery-box-premium-hvs-10-2.jpg',
    700000::bigint, 900000::bigint
  ),
  (
    'huawei',
    'Huawei LUNA2000-10-S0',
    'huawei-luna2000-10-s0',
    'Modulaire thuisbatterij die vaak samen met Huawei-zonnepanelenomvormers wordt geplaatst.',
    'Huawei LUNA2000 is een LiFePO4-systeem met modules van 5 kWh. De 10 kWh-configuratie (S0) is gangbaar bij Nederlandse woningen. Installatie en inregeling via een gecertificeerde partner.',
    10.0, 5.0, 6000, 10, true,
    '/images/products/huawei-luna2000-10-s0.jpg',
    580000::bigint, 850000::bigint
  ),
  (
    'solaredge',
    'SolarEdge Home Battery 10 kWh',
    'solaredge-home-battery-10',
    'Thuisbatterij voor SolarEdge-ecosysteem met monitoring in de app.',
    'De SolarEdge Home Battery is ontworpen voor woningen met SolarEdge-omvormers en power optimizers. Capaciteit rond 10 kWh, uitbreidbaar in het ecosysteem. Installatie door SolarEdge-partner.',
    9.7, 5.0, 6000, 10, true,
    '/images/products/solaredge-home-battery-10.jpg',
    800000::bigint, 1000000::bigint
  ),
  (
    'enphase',
    'Enphase IQ Battery 5P',
    'enphase-iq-battery-5p',
    'Modulaire AC-gekoppelde batterij, ideaal bij Enphase micro-omvormers.',
    'De Enphase IQ Battery 5P levert circa 5 kWh bruikbare capaciteit per unit en is stapelbaar. AC-gekoppeld, dus ook achteraf te plaatsen bij bestaande PV. Installatie door een Enphase-gecertificeerde installateur.',
    5.0, 3.84, 6000, 15, true,
    '/images/products/enphase-iq-battery-5p.jpg',
    500000::bigint, 750000::bigint
  ),
  (
    'sigenergy',
    'Sigenergy SigenStor 10',
    'sigenergy-sigenstor-10',
    'Hybride energiehub met batterij, omvormer en optionele EV-lader.',
    'Sigenergy SigenStor combineert opslag en hybride omvorming in één modulaire hub. Populair bij huishoudens die zonnepanelen, batterij en laden willen bundelen. Professionele installatie vereist.',
    10.0, 12.0, 6000, 10, true,
    '/images/products/sigenergy-sigenstor-10.jpg',
    700000::bigint, 1000000::bigint
  ),
  (
    'sonnen',
    'Sonnen eco 8',
    'sonnen-eco-8',
    'Premium thuisbatterij met focus op zelfconsumptie en community-features.',
    'De Sonnen eco 8 is een premium all-in-one systeem gericht op maximale zelfconsumptie. Geschikt voor huishoudens die kwaliteit en software boven de laagste aanschafprijs zetten. Installatie via Sonnen-partner.',
    8.0, 3.3, 10000, 10, true,
    '/images/products/sonnen-eco-8.jpg',
    900000::bigint, 1250000::bigint
  ),
  (
    'foxess',
    'FoxESS ECS 10.4',
    'foxess-ecs-10-4',
    'Prijs/kwaliteit middensegment met modulaire capaciteit.',
    'FoxESS ECS is een modulaire thuisbatterij die vaak met FoxESS hybride omvormers wordt gecombineerd. Interessant voor huishoudens die meer capaciteit zoeken zonder premium-prijs. Wandmontage door installateur.',
    10.4, 5.0, 6000, 10, true,
    '/images/products/foxess-ecs-10-4.jpg',
    700000::bigint, 900000::bigint
  )
) as v(brand_slug, name, slug, summary, description, capacity, power, cycles, warranty, expandable, image_path, indicative_min_cents, indicative_max_cents)
join brands b on b.slug = v.brand_slug
on conflict (slug) do update set
  name = excluded.name,
  summary = excluded.summary,
  description = excluded.description,
  status = 'published',
  capacity_kwh = excluded.capacity_kwh,
  power_kw = excluded.power_kw,
  cycles = excluded.cycles,
  warranty_years = excluded.warranty_years,
  expandable = excluded.expandable,
  image_path = excluded.image_path,
  product_type = 'fixed',
  indicative_price_min_cents = excluded.indicative_price_min_cents,
  indicative_price_max_cents = excluded.indicative_price_max_cents,
  published_at = coalesce(products.published_at, now()),
  updated_at = now();

insert into product_categories (product_id, category_id)
select p.id, c.id
from products p
cross join categories c
where c.slug = 'vaste-thuisbatterijen'
  and p.slug in (
    'tesla-powerwall-3',
    'byd-battery-box-premium-hvs-10-2',
    'huawei-luna2000-10-s0',
    'solaredge-home-battery-10',
    'enphase-iq-battery-5p',
    'sigenergy-sigenstor-10',
    'sonnen-eco-8',
    'foxess-ecs-10-4'
  )
on conflict do nothing;

insert into product_categories (product_id, category_id)
select p.id, c.id
from products p
cross join categories c
where c.slug = 'uitbreidbaar'
  and p.slug in (
    'byd-battery-box-premium-hvs-10-2',
    'huawei-luna2000-10-s0',
    'solaredge-home-battery-10',
    'enphase-iq-battery-5p',
    'sigenergy-sigenstor-10',
    'sonnen-eco-8',
    'foxess-ecs-10-4'
  )
on conflict do nothing;

-- Specs: installation + chemistry + inverter
insert into product_specs (product_id, spec_id, value_number, value_boolean, value_text)
select p.id, s.id, v.value_number, null, v.value_text
from (values
  ('tesla-powerwall-3', 'installation', null::numeric, 'Wandmontage (installateur)'::text),
  ('tesla-powerwall-3', 'chemistry', null::numeric, 'LiFePO4'::text),
  ('tesla-powerwall-3', 'inverter_w', 11500::numeric, null::text),
  ('byd-battery-box-premium-hvs-10-2', 'installation', null::numeric, 'Wandmontage (installateur)'::text),
  ('byd-battery-box-premium-hvs-10-2', 'chemistry', null::numeric, 'LiFePO4'::text),
  ('byd-battery-box-premium-hvs-10-2', 'inverter_w', 9000::numeric, null::text),
  ('huawei-luna2000-10-s0', 'installation', null::numeric, 'Wandmontage (installateur)'::text),
  ('huawei-luna2000-10-s0', 'chemistry', null::numeric, 'LiFePO4'::text),
  ('huawei-luna2000-10-s0', 'inverter_w', 5000::numeric, null::text),
  ('solaredge-home-battery-10', 'installation', null::numeric, 'Wandmontage (installateur)'::text),
  ('solaredge-home-battery-10', 'chemistry', null::numeric, 'LiFePO4'::text),
  ('solaredge-home-battery-10', 'inverter_w', 5000::numeric, null::text),
  ('enphase-iq-battery-5p', 'installation', null::numeric, 'Wandmontage (installateur)'::text),
  ('enphase-iq-battery-5p', 'chemistry', null::numeric, 'LiFePO4'::text),
  ('enphase-iq-battery-5p', 'inverter_w', 3840::numeric, null::text),
  ('sigenergy-sigenstor-10', 'installation', null::numeric, 'Wandmontage (installateur)'::text),
  ('sigenergy-sigenstor-10', 'chemistry', null::numeric, 'LiFePO4'::text),
  ('sigenergy-sigenstor-10', 'inverter_w', 12000::numeric, null::text),
  ('sonnen-eco-8', 'installation', null::numeric, 'Wandmontage (installateur)'::text),
  ('sonnen-eco-8', 'chemistry', null::numeric, 'LiFePO4'::text),
  ('sonnen-eco-8', 'inverter_w', 3300::numeric, null::text),
  ('foxess-ecs-10-4', 'installation', null::numeric, 'Wandmontage (installateur)'::text),
  ('foxess-ecs-10-4', 'chemistry', null::numeric, 'LiFePO4'::text),
  ('foxess-ecs-10-4', 'inverter_w', 5000::numeric, null::text)
) as v(product_slug, spec_key, value_number, value_text)
join products p on p.slug = v.product_slug
join spec_definitions s on s.key = v.spec_key
on conflict (product_id, spec_id) do update set
  value_number = excluded.value_number,
  value_text = excluded.value_text;
