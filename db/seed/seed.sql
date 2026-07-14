-- =========================================================================
-- seed.sql — deterministische seed (idempotent via on conflict)
-- Realistische, publiek bekende plug-and-play stekkerbatterijen.
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
  ('inverter_w', 'Omvormer', 'W', 'number', 70)
on conflict (key) do nothing;

-- Categorieën
insert into categories (name, slug, description, sort_order) values
  ('Balkonbatterijen', 'balkonbatterijen', 'Compacte plug-and-play batterijen voor balkon en kleine opstellingen.', 10),
  ('Thuisbatterijen', 'thuisbatterijen', 'Grotere uitbreidbare stekkerbatterijen voor het hele huishouden.', 20),
  ('Uitbreidbaar', 'uitbreidbaar', 'Batterijen die je later kunt uitbreiden met extra modules.', 30)
on conflict (slug) do nothing;

-- Merken
insert into brands (name, slug, website_url) values
  ('Zendure', 'zendure', 'https://zendure.com'),
  ('EcoFlow', 'ecoflow', 'https://ecoflow.com'),
  ('Anker', 'anker-solix', 'https://anker.com'),
  ('Marstek', 'marstek', 'https://marstek.com'),
  ('Growatt', 'growatt', 'https://growatt.com'),
  ('Sunology', 'sunology', 'https://sunology.eu')
on conflict (slug) do nothing;

-- Aanbieders (één is 'wij')
insert into merchants (name, slug, is_self, website_url) values
  ('Stekkerbatterij Shop', 'stekkerbatterij-shop', true, null),
  ('Coolblue', 'coolblue', false, 'https://coolblue.nl'),
  ('bol', 'bol', false, 'https://bol.com'),
  ('Zonneplan', 'zonneplan', false, 'https://zonneplan.nl')
on conflict (slug) do nothing;

-- Producten
insert into products (brand_id, name, slug, summary, description, status, capacity_kwh, power_kw, cycles, warranty_years, expandable, published_at)
select b.id, v.name, v.slug, v.summary, v.description, 'published', v.capacity, v.power, v.cycles, v.warranty, v.expandable, now()
from (values
  ('zendure', 'Zendure SolarFlow 800', 'zendure-solarflow-800',
   'Compacte plug-and-play batterij met slimme sturing, ideaal om overtollige zonne-energie op te slaan.',
   'De Zendure SolarFlow 800 slaat overdag opgewekte zonne-energie op en levert deze terug wanneer je verbruik piekt. Uitbreidbaar met extra AB2000-modules.',
   1.92, 0.8, 6000, 10, true),
  ('ecoflow', 'EcoFlow PowerStream 800', 'ecoflow-powerstream-800',
   'Micro-omvormer met batterij die je verbruik in realtime volgt en teruglevering minimaliseert.',
   'EcoFlow PowerStream stuurt op basis van je actuele verbruik en slaat overschot op in de gekoppelde batterij.',
   2.0, 0.8, 6500, 5, true),
  ('anker-solix', 'Anker SOLIX Solarbank 2 E1600', 'anker-solix-solarbank-2-e1600',
   'Populaire balkonbatterij met ingebouwde MPPT en app-sturing.',
   'De Anker SOLIX Solarbank 2 combineert opslag met slimme sturing en is eenvoudig uit te breiden.',
   1.6, 0.8, 6000, 10, true),
  ('marstek', 'Marstek Venus 5.12kWh', 'marstek-venus-512',
   'Grotere all-in-one stekkerbatterij voor het hele huishouden.',
   'De Marstek Venus biedt met 5,12 kWh ruime opslag en dynamische sturing op energieprijzen.',
   5.12, 2.5, 6000, 10, false),
  ('growatt', 'Growatt NOAH 2000', 'growatt-noah-2000',
   'Modulaire balkonbatterij die je stapelt tot de gewenste capaciteit.',
   'Growatt NOAH 2000 is volledig modulair en koppelbaar; groei mee met je behoefte.',
   2.048, 0.8, 6000, 10, true),
  ('sunology', 'Sunology Storey', 'sunology-storey',
   'Gebruiksvriendelijke plug-and-play batterij met focus op eenvoud.',
   'Sunology Storey is een toegankelijke stekkerbatterij die je zonder installateur aansluit.',
   2.0, 0.8, 6000, 5, false)
) as v(brand_slug, name, slug, summary, description, capacity, power, cycles, warranty, expandable)
join brands b on b.slug = v.brand_slug
on conflict (slug) do nothing;

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
  ('growatt-noah-2000','balkonbatterijen'),
  ('growatt-noah-2000','uitbreidbaar'),
  ('sunology-storey','balkonbatterijen')
) as m(pslug, cslug) on m.pslug = p.slug
join categories c on c.slug = m.cslug
on conflict do nothing;

-- Offers
insert into offers (product_id, merchant_id, price_cents, stock_status, delivery_days, is_sponsored, affiliate_url)
select p.id, m.id, v.price_cents, v.stock, v.delivery, v.sponsored, v.url
from (values
  ('zendure-solarflow-800','stekkerbatterij-shop', 89900, 'in_stock', 2, false, null),
  ('zendure-solarflow-800','coolblue', 94900, 'in_stock', 1, true, 'https://coolblue.nl'),
  ('ecoflow-powerstream-800','stekkerbatterij-shop', 99900, 'in_stock', 3, false, null),
  ('ecoflow-powerstream-800','bol', 104900, 'in_stock', 2, true, 'https://bol.com'),
  ('anker-solix-solarbank-2-e1600','stekkerbatterij-shop', 84900, 'in_stock', 2, false, null),
  ('anker-solix-solarbank-2-e1600','coolblue', 87900, 'preorder', 7, true, 'https://coolblue.nl'),
  ('marstek-venus-512','stekkerbatterij-shop', 189900, 'in_stock', 5, false, null),
  ('marstek-venus-512','zonneplan', 199900, 'in_stock', 5, true, 'https://zonneplan.nl'),
  ('growatt-noah-2000','stekkerbatterij-shop', 99900, 'in_stock', 3, false, null),
  ('sunology-storey','stekkerbatterij-shop', 99900, 'out_of_stock', null, false, null),
  ('sunology-storey','bol', 109900, 'in_stock', 2, true, 'https://bol.com')
) as v(pslug, mslug, price_cents, stock, delivery, sponsored, url)
join products p on p.slug = v.pslug
join merchants m on m.slug = v.mslug
on conflict (product_id, merchant_id) do nothing;

-- Historische prijzen (trend voor de grafiek) op de eigen offers
insert into price_history (offer_id, price_cents, recorded_at)
select o.id, v.price_cents, now() - (v.days_ago || ' days')::interval
from (values
  ('zendure-solarflow-800', 99900, 90),
  ('zendure-solarflow-800', 96900, 60),
  ('zendure-solarflow-800', 93900, 30),
  ('anker-solix-solarbank-2-e1600', 92900, 75),
  ('anker-solix-solarbank-2-e1600', 88900, 40),
  ('marstek-venus-512', 209900, 80),
  ('marstek-venus-512', 199900, 35)
) as v(pslug, price_cents, days_ago)
join products p on p.slug = v.pslug
join merchants m on m.slug = 'stekkerbatterij-shop'
join offers o on o.product_id = p.id and o.merchant_id = m.id;

-- FAQ
insert into faqs (question, answer, sort_order) values
  ('Wat is een stekkerbatterij?', 'Een stekkerbatterij (plug-and-play thuisbatterij) sluit je zonder installateur aan op een stopcontact of groep. Hij slaat overtollige zonne-energie op en levert die terug wanneer je die nodig hebt.', 10),
  ('Heb ik zonnepanelen nodig?', 'Niet per se. Met zonnepanelen bespaar je het meest, maar sommige batterijen laden ook slim op tijdens goedkope uren van een dynamisch energiecontract.', 20),
  ('Is een stekkerbatterij veilig?', 'Kies altijd voor batterijen met de juiste certificeringen (CE, en bij voorkeur getest volgens relevante veiligheidsnormen). Let op de beschermingsklasse (IP) bij plaatsing buiten.', 30),
  ('Loont een stekkerbatterij zonder saldering?', 'Naarmate de salderingsregeling wordt afgebouwd, wordt zelf opslaan en later verbruiken aantrekkelijker. Onze beslishulp rekent dit voor jouw situatie door.', 40)
on conflict do nothing;

-- Content / gidsen
insert into content_articles (title, slug, excerpt, body, status, published_at) values
  ('Stekkerbatterij kopen: complete koopgids 2026', 'stekkerbatterij-koopgids',
   'Alles wat je moet weten voordat je een plug-and-play thuisbatterij kiest: capaciteit, vermogen, veiligheid en terugverdientijd.',
   '[{"type":"paragraph","text":"Een stekkerbatterij is de eenvoudigste manier om zelf energie op te slaan. In deze gids leggen we uit waar je op let."},{"type":"heading","text":"Capaciteit en vermogen"},{"type":"paragraph","text":"Capaciteit (kWh) bepaalt hoeveel je opslaat; vermogen (kW) hoe snel je laadt en ontlaadt."},{"type":"heading","text":"Veiligheid"},{"type":"paragraph","text":"Let op certificeringen en plaatsing volgens de beschermingsklasse."}]'::jsonb,
   'published', now()),
  ('Saldering wordt afgebouwd: wat betekent dat voor jou?', 'saldering-afbouw',
   'De salderingsregeling verdwijnt. We leggen uit hoe een stekkerbatterij je helpt om onafhankelijker te worden.',
   '[{"type":"paragraph","text":"Met het afbouwen van de salderingsregeling wordt zelfverbruik belangrijker."},{"type":"heading","text":"Waarom opslaan loont"},{"type":"paragraph","text":"Door overschot op te slaan gebruik je je eigen stroom in plaats van tegen een lage vergoeding terug te leveren."}]'::jsonb,
   'published', now())
on conflict (slug) do nothing;

-- Content ↔ product/categorie links
insert into content_links (article_id, category_id)
select a.id, c.id
from content_articles a
join categories c on c.slug = 'balkonbatterijen'
where a.slug = 'stekkerbatterij-koopgids'
on conflict do nothing;

-- Ververs review-aggregaten (nog leeg, maar consistent)
select refresh_product_rating_stats();
