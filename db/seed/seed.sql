-- =========================================================================
-- seed.sql — deterministische, idempotente seed.
-- Realistische plug-and-play stekkerbatterijen, aanbieders, specs, reviews
-- en content. Herbruikbaar: producten worden ge-upsert zodat afbeeldingen
-- en velden ook op een reeds gevulde database worden bijgewerkt.
-- =========================================================================

-- Businessregels
insert into business_settings (key, value) values
  ('vat_rate', '0.21'::jsonb),
  ('currency', '"EUR"'::jsonb),
  ('comparison_max_items', '4'::jsonb),
  ('ranking_weights', '{"price":0.35,"capacity":0.25,"warranty":0.2,"rating":0.2}'::jsonb)
on conflict (key) do nothing;

-- Spec-definities
insert into spec_definitions (key, label, unit, data_type, sort_order) values
  ('capacity_kwh', 'Capaciteit', 'kWh', 'number', 10),
  ('power_kw', 'Vermogen', 'kW', 'number', 20),
  ('cycles', 'Levensduur', 'cycli', 'number', 30),
  ('warranty_years', 'Garantie', 'jaar', 'number', 40),
  ('expandable', 'Uitbreidbaar', null, 'boolean', 50),
  ('ip_rating', 'Beschermingsklasse', null, 'text', 60),
  ('inverter_w', 'Omvormer', 'W', 'number', 70),
  ('chemistry', 'Celtype', null, 'text', 80),
  ('weight_kg', 'Gewicht', 'kg', 'number', 90),
  ('installation', 'Installatie', null, 'text', 100)
on conflict (key) do update set
  label = excluded.label, unit = excluded.unit,
  data_type = excluded.data_type, sort_order = excluded.sort_order;

-- Categorieën
insert into categories (name, slug, description, sort_order) values
  ('Balkonbatterijen', 'balkonbatterijen', 'Compacte plug-and-play batterijen voor balkon en kleine opstellingen.', 10),
  ('Thuisbatterijen', 'thuisbatterijen', 'Grotere uitbreidbare stekkerbatterijen voor het hele huishouden.', 20),
  ('Uitbreidbaar', 'uitbreidbaar', 'Batterijen die je later kunt uitbreiden met extra modules.', 30),
  ('Dynamisch contract', 'dynamisch-contract', 'Batterijen die slim laden op de goedkoopste uren van een dynamisch energiecontract.', 40)
on conflict (slug) do update set description = excluded.description, sort_order = excluded.sort_order;

-- Merken
insert into brands (name, slug, website_url) values
  ('Zendure', 'zendure', 'https://zendure.com'),
  ('EcoFlow', 'ecoflow', 'https://ecoflow.com'),
  ('Anker SOLIX', 'anker-solix', 'https://anker.com'),
  ('Marstek', 'marstek', 'https://marstek.com'),
  ('Growatt', 'growatt', 'https://growatt.com'),
  ('Sunology', 'sunology', 'https://sunology.eu'),
  ('Sessy', 'sessy', 'https://sessy.nl'),
  ('HomeWizard', 'homewizard', 'https://homewizard.com')
on conflict (slug) do update set name = excluded.name, website_url = excluded.website_url;

-- Aanbieders (één is 'wij')
insert into merchants (name, slug, is_self, website_url) values
  ('Stekkerbatterij Shop', 'stekkerbatterij-shop', true, null),
  ('Coolblue', 'coolblue', false, 'https://coolblue.nl'),
  ('bol', 'bol', false, 'https://bol.com'),
  ('Zonneplan', 'zonneplan', false, 'https://zonneplan.nl'),
  ('Solar Sale', 'solar-sale', false, 'https://solarsale.nl'),
  ('Gamma', 'gamma', false, 'https://gamma.nl'),
  ('Zendure', 'zendure', false, 'https://zendure.nl'),
  ('HomeWizard', 'homewizard', false, 'https://www.homewizard.com'),
  ('Sessy', 'sessy', false, 'https://www.sessy.nl'),
  ('Sunology', 'sunology', false, 'https://sunology.eu'),
  ('EcoFlow', 'ecoflow', false, 'https://nl.ecoflow.com')
on conflict (slug) do update set name = excluded.name, website_url = excluded.website_url;

-- Producten (upsert incl. afbeelding)
insert into products (brand_id, name, slug, summary, description, status, capacity_kwh, power_kw, cycles, warranty_years, expandable, image_path, published_at)
select b.id, v.name, v.slug, v.summary, v.description, 'published', v.capacity, v.power, v.cycles, v.warranty, v.expandable, v.image_path, now()
from (values
  ('zendure', 'Zendure SolarFlow 800', 'zendure-solarflow-800',
   'Compacte plug-and-play batterij met slimme sturing, ideaal om overtollige zonne-energie op te slaan.',
   'De Zendure SolarFlow 800 slaat overdag opgewekte zonne-energie op en levert deze terug wanneer je verbruik piekt. Uitbreidbaar met extra AB2000-modules en te sturen via de app.',
   1.92, 0.8, 6000, 10, true, '/images/products/zendure-solarflow-800.jpg'),
  ('ecoflow', 'EcoFlow PowerStream 800', 'ecoflow-powerstream-800',
   'Micro-omvormer met batterij die je verbruik in realtime volgt en teruglevering minimaliseert.',
   'EcoFlow PowerStream stuurt op basis van je actuele verbruik en slaat overschot op in de gekoppelde batterij. Ideaal in combinatie met balkon- of tuinpanelen.',
   2.0, 0.8, 6500, 5, true, '/images/products/ecoflow-powerstream-800.jpg'),
  ('anker-solix', 'Anker SOLIX Solarbank 2 E1600', 'anker-solix-solarbank-2-e1600',
   'Populaire balkonbatterij met ingebouwde MPPT en app-sturing.',
   'De Anker SOLIX Solarbank 2 combineert opslag met slimme sturing, heeft een ingebouwde omvormer en is eenvoudig uit te breiden.',
   1.6, 0.8, 6000, 10, true, '/images/products/anker-solix-solarbank-2-e1600.jpg'),
  ('marstek', 'Marstek Venus 5.12kWh', 'marstek-venus-512',
   'Grotere all-in-one stekkerbatterij voor het hele huishouden.',
   'De Marstek Venus biedt met 5,12 kWh ruime opslag en stuurt dynamisch op energieprijzen. Stil, compact en zonder installateur aan te sluiten.',
   5.12, 2.5, 6000, 10, false, '/images/products/marstek-venus-512.jpg'),
  ('growatt', 'Growatt NOAH 2000', 'growatt-noah-2000',
   'Modulaire balkonbatterij die je stapelt tot de gewenste capaciteit.',
   'Growatt NOAH 2000 is volledig modulair en koppelbaar; groei mee met je behoefte tot een flink pakket.',
   2.048, 0.8, 6000, 10, true, '/images/products/growatt-noah-2000.jpg'),
  ('sunology', 'Sunology Storey', 'sunology-storey',
   'Gebruiksvriendelijke plug-and-play batterij met focus op eenvoud.',
   'Sunology Storey is een toegankelijke stekkerbatterij die je zonder installateur aansluit en bedient via een heldere app.',
   2.0, 0.8, 6000, 5, false, '/images/products/sunology-storey.jpg'),
  ('sessy', 'Sessy Thuisbatterij', 'sessy-thuisbatterij',
   'Nederlandse thuisbatterij die automatisch handelt op de energiemarkt.',
   'De Sessy is een in Nederland ontworpen thuisbatterij van 5 kWh die automatisch laadt en ontlaadt op basis van dynamische energieprijzen. Koppelbaar tot meerdere units.',
   5.0, 2.2, 6000, 10, true, '/images/products/sessy-thuisbatterij.jpg'),
  ('marstek', 'Marstek Jupiter C 10.24kWh', 'marstek-jupiter-c-1024',
   'Ruime, uitbreidbare thuisbatterij voor huishoudens met hoog verbruik.',
   'De Marstek Jupiter C biedt 10,24 kWh in een strakke modulaire toren en is ideaal voor grotere huishoudens met zonnepanelen en een dynamisch contract.',
   10.24, 3.0, 6000, 10, true, '/images/products/marstek-jupiter-c-1024.jpg'),
  ('homewizard', 'HomeWizard Plug-In Battery', 'homewizard-plug-in-battery',
   'Slimme, compacte plug-in batterij die naadloos samenwerkt met de HomeWizard-app.',
   'De HomeWizard Plug-In Battery is een gebruiksvriendelijke stekkerbatterij die je energie slim opslaat en volledig integreert met het HomeWizard-ecosysteem.',
   2.7, 0.8, 6000, 5, false, '/images/products/homewizard-plug-in-battery.jpg')
) as v(brand_slug, name, slug, summary, description, capacity, power, cycles, warranty, expandable, image_path)
join brands b on b.slug = v.brand_slug
on conflict (slug) do update set
  brand_id = excluded.brand_id, name = excluded.name, summary = excluded.summary,
  description = excluded.description, status = 'published',
  capacity_kwh = excluded.capacity_kwh, power_kw = excluded.power_kw,
  cycles = excluded.cycles, warranty_years = excluded.warranty_years,
  expandable = excluded.expandable, image_path = excluded.image_path,
  published_at = coalesce(products.published_at, now());

-- Product ↔ categorie
insert into product_categories (product_id, category_id)
select p.id, c.id
from products p
join (values
  ('zendure-solarflow-800','balkonbatterijen'),
  ('zendure-solarflow-800','uitbreidbaar'),
  ('ecoflow-powerstream-800','balkonbatterijen'),
  ('ecoflow-powerstream-800','uitbreidbaar'),
  ('anker-solix-solarbank-2-e1600','balkonbatterijen'),
  ('anker-solix-solarbank-2-e1600','uitbreidbaar'),
  ('marstek-venus-512','thuisbatterijen'),
  ('marstek-venus-512','dynamisch-contract'),
  ('growatt-noah-2000','balkonbatterijen'),
  ('growatt-noah-2000','uitbreidbaar'),
  ('sunology-storey','balkonbatterijen'),
  ('sessy-thuisbatterij','thuisbatterijen'),
  ('sessy-thuisbatterij','uitbreidbaar'),
  ('sessy-thuisbatterij','dynamisch-contract'),
  ('marstek-jupiter-c-1024','thuisbatterijen'),
  ('marstek-jupiter-c-1024','uitbreidbaar'),
  ('marstek-jupiter-c-1024','dynamisch-contract'),
  ('homewizard-plug-in-battery','balkonbatterijen')
) as m(pslug, cslug) on m.pslug = p.slug
join categories c on c.slug = m.cslug
on conflict do nothing;

-- Productspecs (herbruikbaar: eerst opschonen)
delete from product_specs where product_id in (select id from products);

insert into product_specs (product_id, spec_id, value_number, value_boolean, value_text)
select p.id, s.id, v.num, v.bool, v.txt
from (values
  ('zendure-solarflow-800', 'ip_rating', null::numeric, null::boolean, 'IP65'),
  ('zendure-solarflow-800', 'inverter_w', 800, null, null),
  ('zendure-solarflow-800', 'chemistry', null, null, 'LiFePO4'),
  ('zendure-solarflow-800', 'weight_kg', 18, null, null),
  ('zendure-solarflow-800', 'installation', null, null, 'Plug & play'),
  ('ecoflow-powerstream-800', 'ip_rating', null, null, 'IP65'),
  ('ecoflow-powerstream-800', 'inverter_w', 800, null, null),
  ('ecoflow-powerstream-800', 'chemistry', null, null, 'LiFePO4'),
  ('ecoflow-powerstream-800', 'weight_kg', 19, null, null),
  ('ecoflow-powerstream-800', 'installation', null, null, 'Plug & play'),
  ('anker-solix-solarbank-2-e1600', 'ip_rating', null, null, 'IP65'),
  ('anker-solix-solarbank-2-e1600', 'inverter_w', 800, null, null),
  ('anker-solix-solarbank-2-e1600', 'chemistry', null, null, 'LiFePO4'),
  ('anker-solix-solarbank-2-e1600', 'weight_kg', 21, null, null),
  ('anker-solix-solarbank-2-e1600', 'installation', null, null, 'Plug & play'),
  ('marstek-venus-512', 'ip_rating', null, null, 'IP21'),
  ('marstek-venus-512', 'inverter_w', 2500, null, null),
  ('marstek-venus-512', 'chemistry', null, null, 'LiFePO4'),
  ('marstek-venus-512', 'weight_kg', 52, null, null),
  ('marstek-venus-512', 'installation', null, null, 'Plug & play (binnen)'),
  ('growatt-noah-2000', 'ip_rating', null, null, 'IP66'),
  ('growatt-noah-2000', 'inverter_w', 800, null, null),
  ('growatt-noah-2000', 'chemistry', null, null, 'LiFePO4'),
  ('growatt-noah-2000', 'weight_kg', 23, null, null),
  ('growatt-noah-2000', 'installation', null, null, 'Plug & play'),
  ('sunology-storey', 'ip_rating', null, null, 'IP65'),
  ('sunology-storey', 'inverter_w', 800, null, null),
  ('sunology-storey', 'chemistry', null, null, 'LiFePO4'),
  ('sunology-storey', 'weight_kg', 20, null, null),
  ('sunology-storey', 'installation', null, null, 'Plug & play'),
  ('sessy-thuisbatterij', 'ip_rating', null, null, 'IP21'),
  ('sessy-thuisbatterij', 'inverter_w', 2200, null, null),
  ('sessy-thuisbatterij', 'chemistry', null, null, 'LiFePO4'),
  ('sessy-thuisbatterij', 'weight_kg', 48, null, null),
  ('sessy-thuisbatterij', 'installation', null, null, 'Plug & play (binnen)'),
  ('marstek-jupiter-c-1024', 'ip_rating', null, null, 'IP21'),
  ('marstek-jupiter-c-1024', 'inverter_w', 3000, null, null),
  ('marstek-jupiter-c-1024', 'chemistry', null, null, 'LiFePO4'),
  ('marstek-jupiter-c-1024', 'weight_kg', 96, null, null),
  ('marstek-jupiter-c-1024', 'installation', null, null, 'Plug & play (binnen)'),
  ('homewizard-plug-in-battery', 'ip_rating', null, null, 'IP54'),
  ('homewizard-plug-in-battery', 'inverter_w', 800, null, null),
  ('homewizard-plug-in-battery', 'chemistry', null, null, 'LiFePO4'),
  ('homewizard-plug-in-battery', 'weight_kg', 26, null, null),
  ('homewizard-plug-in-battery', 'installation', null, null, 'Plug & play')
) as v(pslug, skey, num, bool, txt)
join products p on p.slug = v.pslug
join spec_definitions s on s.key = v.skey
on conflict (product_id, spec_id) do update set
  value_number = excluded.value_number, value_boolean = excluded.value_boolean,
  value_text = excluded.value_text;

-- Offers (upsert)
insert into offers (product_id, merchant_id, price_cents, stock_status, delivery_days, is_sponsored, affiliate_url)
select p.id, m.id, v.price_cents, v.stock, v.delivery, v.sponsored, v.url
from (values
  -- Geen Bol/Coolblue voor SolarFlow 800 tot SKU geverifieerd is (was AB3000X mismatch).
  ('zendure-solarflow-800','stekkerbatterij-shop', 89900, 'in_stock', 2, false, null),
  -- Officiele Zendure-shop: SolarFlow 800 + AB2000L (1,92 kWh), bron zendure.nl 2026-07-19.
  ('zendure-solarflow-800','zendure', 74700, 'in_stock', 3, false, 'https://www.zendure.nl/products/solarflow-800'),
  ('ecoflow-powerstream-800','stekkerbatterij-shop', 99900, 'in_stock', 3, false, null),
  -- Geen Bol PowerStream→STREAM AC Pro mismatch.
  ('ecoflow-powerstream-800','solar-sale', 98900, 'in_stock', 4, false, 'https://solarsale.nl'),
  ('anker-solix-solarbank-2-e1600','stekkerbatterij-shop', 84900, 'in_stock', 2, false, null),
  ('anker-solix-solarbank-2-e1600','coolblue', 87900, 'preorder', 7, true, 'https://coolblue.nl'),
  ('anker-solix-solarbank-2-e1600','gamma', 89900, 'in_stock', 3, false, 'https://gamma.nl'),
  -- Geen Bol E1600→E1600 Pro mismatch.
  ('marstek-venus-512','stekkerbatterij-shop', 189900, 'in_stock', 5, false, null),
  ('marstek-venus-512','zonneplan', 199900, 'in_stock', 5, true, 'https://zonneplan.nl'),
  ('marstek-venus-512','bol', 121000, 'in_stock', 5, false, 'https://www.bol.com/nl/nl/p/marstek-venus-e-3-0-5-12kwh-plug-play-thuisbatterij-via-230v-stopcontact/9300000240523865/'),
  ('growatt-noah-2000','stekkerbatterij-shop', 99900, 'in_stock', 3, false, null),
  ('growatt-noah-2000','solar-sale', 96900, 'in_stock', 4, false, 'https://solarsale.nl'),
  ('sunology-storey','stekkerbatterij-shop', 99900, 'out_of_stock', null, false, null),
  ('sunology-storey','bol', 109900, 'out_of_stock', 2, false, 'https://www.bol.com'),
  ('sessy-thuisbatterij','stekkerbatterij-shop', 159900, 'in_stock', 5, false, null),
  ('sessy-thuisbatterij','zonneplan', 164900, 'in_stock', 7, true, 'https://zonneplan.nl'),
  ('marstek-jupiter-c-1024','stekkerbatterij-shop', 289900, 'in_stock', 7, false, null),
  ('marstek-jupiter-c-1024','solar-sale', 299900, 'in_stock', 10, false, 'https://solarsale.nl'),
  ('homewizard-plug-in-battery','stekkerbatterij-shop', 119900, 'preorder', 14, false, null)
  -- HomeWizard × Coolblue bewust weggelaten: seed-placeholder 905678 was Apple Watch.
) as v(pslug, mslug, price_cents, stock, delivery, sponsored, url)
join products p on p.slug = v.pslug
join merchants m on m.slug = v.mslug
on conflict (product_id, merchant_id) do update set
  price_cents = excluded.price_cents, stock_status = excluded.stock_status,
  delivery_days = excluded.delivery_days, is_sponsored = excluded.is_sponsored,
  affiliate_url = excluded.affiliate_url, last_checked_at = now();

-- ---------------------------------------------------------------------------
-- Monetization: affiliate metadata, energie-partners, dropship heroes
-- ---------------------------------------------------------------------------

update merchants set
  default_affiliate_network = v.network,
  deeplink_param_template = v.params::jsonb
from (values
  ('bol', 'bol-partner', '{"subid":"{click_ref}"}'::jsonb),
  ('coolblue', 'awin', '{"clickref":"{click_ref}"}'::jsonb),
  ('gamma', 'awin', '{"clickref":"{click_ref}"}'::jsonb),
  ('zonneplan', 'daisycon', '{"subid":"{click_ref}"}'::jsonb),
  ('solar-sale', 'daisycon', '{"subid":"{click_ref}"}'::jsonb),
  -- Daisycon ds1.nl: ws is de Sub ID-parameter; {click_ref} wordt per klik ingevuld.
  ('zendure', 'daisycon', '{"ws":"{click_ref}"}'::jsonb),
  ('homewizard', 'daisycon', '{"ws":"{click_ref}"}'::jsonb),
  ('ecoflow', 'awin', '{"clickref":"{click_ref}"}'::jsonb)
) as v(mslug, network, params)
where merchants.slug = v.mslug;

-- Product-deeplinks + commissie (placeholders tot publisher-ID's binnen zijn)
update offers o set
  affiliate_deeplink = v.deeplink,
  affiliate_url = coalesce(v.fallback, v.deeplink),
  affiliate_network = v.network,
  commission_type = v.ctype::commission_type,
  commission_rate = v.rate,
  commission_cents_fixed = v.fixed_cents,
  commission_source_url = v.source,
  affiliate_params = v.params::jsonb
from (values
  -- Anker × Gamma assortiment: niet meer in seed (P0 listing). Zie 0028 soft-delete.
  ('ecoflow-powerstream-800','solar-sale',
   'https://solarsale.nl/ecoflow-powerstream-800',
   null, 'daisycon', 'cps', 0.05, null,
   'https://solarsale.nl',
   '{"subid":"{click_ref}"}'),
  ('marstek-venus-512','bol',
   'https://partner.bol.com/click/click?p=2&t=url&s=1532194&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fp%2Fmarstek-venus-e-3-0-5-12kwh-plug-play-thuisbatterij-via-230v-stopcontact%2F9300000240523865%2F',
   'https://www.bol.com/nl/nl/p/marstek-venus-e-3-0-5-12kwh-plug-play-thuisbatterij-via-230v-stopcontact/9300000240523865/',
   'bol-partner', 'cps', 0.075, null,
   'https://www.bol.com/nl/nl/p/marstek-venus-e-3-0-5-12kwh-plug-play-thuisbatterij-via-230v-stopcontact/9300000240523865/',
   '{"subid":"{click_ref}"}'),
  ('marstek-venus-512','zonneplan',
   'https://zonneplan.nl/thuisbatterij/marstek-venus',
   null, 'daisycon', 'cpa', null, 15000,
   'https://zonneplan.nl',
   '{"subid":"{click_ref}"}'),
  ('growatt-noah-2000','solar-sale',
   'https://solarsale.nl/growatt-noah-2000',
   null, 'daisycon', 'cps', 0.05, null,
   'https://solarsale.nl',
   '{"subid":"{click_ref}"}'),
  ('sessy-thuisbatterij','zonneplan',
   'https://zonneplan.nl/thuisbatterij/sessy',
   null, 'daisycon', 'cpa', null, 15000,
   'https://zonneplan.nl',
   '{"subid":"{click_ref}"}'),
  -- HomeWizard × Coolblue: 905678 bleek Apple Watch. Alleen echte product-URL toevoegen.
  ('zendure-solarflow-800','zendure',
   'https://glp8.net/c/?si=20779&li=1881195&wi=423133&ws=&dl=products%2Fsolarflow-800',
   'https://www.zendure.nl/products/solarflow-800',
   'daisycon', 'cps', 0.08, null,
   'https://www.zendure.nl/pages/affiliate-program',
   '{"ws":"{click_ref}"}')
) as v(pslug, mslug, deeplink, fallback, network, ctype, rate, fixed_cents, source, params)
join products p on p.slug = v.pslug
join merchants m on m.slug = v.mslug
where o.product_id = p.id and o.merchant_id = m.id;

-- Zendure Daisycon: outbound geverifieerd (glp8 → zendure.nl/products/solarflow-800), 2026-07-19.
update offers o set
  affiliate_link_status = 'ok',
  affiliate_link_checked_at = now(),
  affiliate_link_note = 'Daisycon li=1881195 wi=423133; redirect OK naar SolarFlow 800',
  last_checked_at = now()
from products p, merchants m
where o.product_id = p.id and o.merchant_id = m.id
  and p.slug = 'zendure-solarflow-800' and m.slug = 'zendure';

-- Daisycon: program_id (si) + link_id (li). Zendure li=1881195 (dashboard 2026-07-19).
-- HomeWizard li ontbreekt nog: geen live HomeWizard-deeplinks tot die binnen is.
insert into partner_programs (slug, name, network, program_id, link_id, commission_type, commission_rate, cookie_days, signup_url, source_url) values
  ('zendure-nl', 'Zendure NL (Daisycon)', 'daisycon', '20779', '1881195', 'cps', 0.08, 30, 'https://daisycon.com/nl/campagnes/20779-zendure-nl/', 'https://www.zendure.nl/pages/affiliate-program'),
  ('homewizard-int', 'HomeWizard INT (Daisycon)', 'daisycon', '18407', '1795784', 'cps', 0.075, 30, 'https://daisycon.com/nl/campagnes/18407-homewizard-int/', 'https://affiliate-net.nl/programmas/homewizard/'),
  ('anker-solix-eu', 'Anker SOLIX EU', 'impact', null, null, 'cps', 0.08, 30, 'https://www.ankersolix.com/eu/become-an-affiliate', 'https://www.ankersolix.com/eu/become-an-affiliate'),
  ('bol-partner', 'bol Partner', 'bol-partner', '1532194', null, 'cps', 0.075, 7, 'https://affiliate.bol.com/', 'https://affiliate.bol.com/'),
  ('ecoflow-nl-awin', 'EcoFlow NL (Awin)', 'awin', '123332', null, 'cps', 0.05, 7, 'https://ui.awin.com/merchant-profile/123332', 'https://ui.awin.com/merchant-profile/123332'),
  ('coolblue-nl-awin', 'Coolblue NL (Awin)', 'awin', '85161', null, 'cps', null, 28, 'https://ui.awin.com/merchant-profile/85161', 'https://www.coolblue.nl/affiliate'),
  ('coolblue-energie-awin', 'Coolblue Energie NL (Awin)', 'awin', '85163', null, 'cpa', null, 30, 'https://ui.awin.com/merchant-profile/85163', 'https://www.coolblue.nl/energie'),
  ('daisycon-energy', 'Daisycon Energie', 'daisycon', null, null, 'cpa', null, 30, 'https://www.daisycon.com/nl/', 'https://affiliate-net.nl/programmas/frankenergie/'),
  ('e-wndr-leads', 'e-WNDR Thuisbatterij leads', 'e-wndr', null, null, 'cpa', null, null, 'https://e-wndr.nl/affiliate-worden/', 'https://e-wndr.nl/affiliate-worden/')
on conflict (slug) do update set
  name = excluded.name,
  network = excluded.network,
  program_id = coalesce(excluded.program_id, partner_programs.program_id),
  link_id = coalesce(excluded.link_id, partner_programs.link_id),
  commission_rate = excluded.commission_rate,
  signup_url = excluded.signup_url,
  source_url = excluded.source_url,
  updated_at = now();

update partner_programs set
  commission_cents_min = 3000, commission_cents_max = 9600
where slug = 'daisycon-energy';

update partner_programs set
  commission_cents_min = 10000, commission_cents_max = 15000
where slug = 'e-wndr-leads';

insert into energy_partners (slug, name, description, affiliate_url, affiliate_network, affiliate_params, commission_type, commission_cents_min, commission_cents_max, commission_source_url, sort_order, active) values
  ('frank-energie', 'Frank Energie',
   'Dynamisch contract met transparante prijzen. Populair bij batterij-eigenaren.',
   'https://www.daisycon.com/nl/publishers/deeplink/?program_id=FRANK_PLACEHOLDER&subid={click_ref}',
   'daisycon', '{"subid":"{click_ref}"}'::jsonb, 'cpa', 3000, 6000,
   'https://affiliate-net.nl/programmas/frankenergie/', 10, false),
  ('vattenfall-flex', 'Vattenfall FlexPrijs',
   'Flexibel dynamisch contract van een bekende energieleverancier.',
   'https://www.daisycon.com/nl/publishers/deeplink/?program_id=VATTENFALL_PLACEHOLDER&subid={click_ref}',
   'daisycon', '{"subid":"{click_ref}"}'::jsonb, 'cpa', 400, 9600,
   'https://affiliate-net.nl/', 20, false)
on conflict (slug) do update set
  description = excluded.description,
  affiliate_url = excluded.affiliate_url,
  commission_cents_min = excluded.commission_cents_min,
  commission_cents_max = excluded.commission_cents_max,
  active = excluded.active,
  updated_at = now();

-- Dropship heroes: leverancier + sellable (checkout blijft uit tot leverancier bevestigd)
insert into suppliers (name, slug, contact_email, website_url) values
  ('Plug-in Battery Groothandel NL', 'plug-in-groothandel', 'orders@example-groothandel.nl', 'https://example-groothandel.nl')
on conflict (slug) do update set name = excluded.name;

update products set
  sellable = true,
  sku = v.sku,
  ean = v.ean,
  cost_cents = v.cost,
  handling_days = 3,
  supplier_id = s.id
from (values
  ('zendure-solarflow-800', 'ZEN-SF800', '8712345678901', 64900),
  ('ecoflow-powerstream-800', 'ECO-PS800', '8712345678902', 74900),
  ('anker-solix-solarbank-2-e1600', 'ANK-E1600', '8712345678903', 59900)
) as v(pslug, sku, ean, cost)
join suppliers s on s.slug = 'plug-in-groothandel'
where products.slug = v.pslug;

-- Historische prijzen (trend voor de grafiek) op de eigen offers — opnieuw opbouwen
delete from price_history;
insert into price_history (offer_id, price_cents, recorded_at)
select o.id, v.price_cents, now() - (v.days_ago || ' days')::interval
from (values
  ('zendure-solarflow-800', 99900, 120),
  ('zendure-solarflow-800', 97900, 90),
  ('zendure-solarflow-800', 96900, 60),
  ('zendure-solarflow-800', 93900, 30),
  ('zendure-solarflow-800', 89900, 5),
  ('anker-solix-solarbank-2-e1600', 94900, 100),
  ('anker-solix-solarbank-2-e1600', 92900, 75),
  ('anker-solix-solarbank-2-e1600', 88900, 40),
  ('anker-solix-solarbank-2-e1600', 84900, 7),
  ('marstek-venus-512', 214900, 110),
  ('marstek-venus-512', 209900, 80),
  ('marstek-venus-512', 199900, 35),
  ('marstek-venus-512', 189900, 6),
  ('sessy-thuisbatterij', 174900, 90),
  ('sessy-thuisbatterij', 169900, 55),
  ('sessy-thuisbatterij', 159900, 10),
  ('marstek-jupiter-c-1024', 309900, 90),
  ('marstek-jupiter-c-1024', 299900, 45),
  ('marstek-jupiter-c-1024', 289900, 8),
  ('growatt-noah-2000', 109900, 80),
  ('growatt-noah-2000', 104900, 40),
  ('growatt-noah-2000', 99900, 6)
) as v(pslug, price_cents, days_ago)
join products p on p.slug = v.pslug
join merchants m on m.slug = 'stekkerbatterij-shop'
join offers o on o.product_id = p.id and o.merchant_id = m.id;

-- ---------------------------------------------------------------------------
-- Reviews komen uitsluitend van echte, ingelogde gebruikers via het
-- reviewformulier (moderatie via status 'pending' -> 'approved').
-- We seeden bewust geen reviews of reviewgebruikers.
-- ---------------------------------------------------------------------------

-- FAQ
insert into faqs (question, answer, sort_order) values
  ('Wat is een stekkerbatterij?', 'Een stekkerbatterij (plug-and-play thuisbatterij) sluit je zonder installateur aan op een stopcontact of groep. Hij slaat overtollige zonne-energie op en levert die terug wanneer je die nodig hebt.', 10),
  ('Heb ik zonnepanelen nodig?', 'Niet per se. Met zonnepanelen bespaar je het meest, maar sommige batterijen laden ook slim op tijdens goedkope uren van een dynamisch energiecontract.', 20),
  ('Is een stekkerbatterij veilig?', 'Kies altijd voor batterijen met de juiste certificeringen (CE, en bij voorkeur getest volgens relevante veiligheidsnormen). Let op de beschermingsklasse (IP) bij plaatsing buiten.', 30),
  ('Loont een stekkerbatterij zonder saldering?', 'Naarmate de salderingsregeling wordt afgebouwd, wordt zelf opslaan en later verbruiken aantrekkelijker. Onze beslishulp rekent dit voor jouw situatie door.', 40),
  ('Hoe snel verdien ik een stekkerbatterij terug?', 'Dat hangt af van je verbruik, je contract en of je zonnepanelen hebt. Gemiddeld ligt de terugverdientijd tussen de 4 en 8 jaar; met een dynamisch contract vaak korter.', 50)
on conflict do nothing;

-- Content / gidsen
insert into content_articles (title, slug, excerpt, body, status, published_at) values
  ('Stekkerbatterij kopen: complete koopgids 2026', 'stekkerbatterij-koopgids',
   'Alles wat je moet weten voordat je een plug-and-play thuisbatterij kiest: capaciteit, vermogen, veiligheid en terugverdientijd.',
   '[{"type":"paragraph","text":"Een stekkerbatterij is de eenvoudigste manier om zelf energie op te slaan. In deze gids leggen we uit waar je op let."},{"type":"heading","text":"Capaciteit en vermogen"},{"type":"paragraph","text":"Capaciteit (kWh) bepaalt hoeveel je opslaat; vermogen (kW) hoe snel je laadt en ontlaadt. Kies capaciteit op basis van je avondverbruik."},{"type":"heading","text":"Veiligheid"},{"type":"paragraph","text":"Let op certificeringen en plaatsing volgens de beschermingsklasse. LiFePO4-cellen zijn de veiligste keuze."},{"type":"heading","text":"Terugverdientijd"},{"type":"paragraph","text":"Met een dynamisch contract en zonnepanelen verdien je een stekkerbatterij het snelst terug."}]'::jsonb,
   'published', now()),
  ('Saldering wordt afgebouwd: wat betekent dat voor jou?', 'saldering-afbouw',
   'De salderingsregeling verdwijnt. We leggen uit hoe een stekkerbatterij je helpt om onafhankelijker te worden.',
   '[{"type":"paragraph","text":"Met het afbouwen van de salderingsregeling wordt zelfverbruik belangrijker."},{"type":"heading","text":"Waarom opslaan loont"},{"type":"paragraph","text":"Door overschot op te slaan gebruik je je eigen stroom in plaats van tegen een lage vergoeding terug te leveren."},{"type":"heading","text":"Wat te doen"},{"type":"paragraph","text":"Bereken met onze beslishulp welke capaciteit bij jouw situatie past."}]'::jsonb,
   'published', now()),
  ('Balkonbatterij of thuisbatterij: wat past bij jou?', 'balkon-of-thuisbatterij',
   'De verschillen tussen compacte balkonbatterijen en grotere thuisbatterijen, en voor wie ze geschikt zijn.',
   '[{"type":"paragraph","text":"Niet elke batterij past bij elk huishouden. We zetten de verschillen op een rij."},{"type":"heading","text":"Balkonbatterijen"},{"type":"paragraph","text":"Compact, betaalbaar en ideaal in combinatie met een paar zonnepanelen."},{"type":"heading","text":"Thuisbatterijen"},{"type":"paragraph","text":"Meer capaciteit en vermogen voor huishoudens met hoog verbruik of een warmtepomp."}]'::jsonb,
   'published', now()),
  ('Dynamisch energiecontract en je batterij optimaal benutten', 'dynamisch-contract-batterij',
   'Zo laat je je stekkerbatterij automatisch handelen op de goedkoopste uren van de dag.',
   '[{"type":"paragraph","text":"Een dynamisch contract combineert perfect met een slimme thuisbatterij."},{"type":"heading","text":"Slim laden"},{"type":"paragraph","text":"De batterij laadt wanneer stroom goedkoop is en ontlaadt tijdens dure uren."},{"type":"heading","text":"Waar op te letten"},{"type":"paragraph","text":"Kies een batterij met goede marktsturing en een betrouwbare app."}]'::jsonb,
   'published', now())
on conflict (slug) do update set
  excerpt = excluded.excerpt, body = excluded.body, status = 'published',
  published_at = coalesce(content_articles.published_at, now());

-- Content ↔ product/categorie links
insert into content_links (article_id, category_id)
select a.id, c.id
from content_articles a
join categories c on c.slug = 'balkonbatterijen'
where a.slug = 'stekkerbatterij-koopgids'
on conflict do nothing;

-- Ververs review-aggregaten
select refresh_product_rating_stats();
