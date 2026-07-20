-- Slimme Energie Shop: accessoire-producten + Bol partner-offers.
-- Prijzen bron: bol.com productpagina's, gecheckt 2026-07-20.
-- Vereist: product_type bevat 'accessory' (migratie 0018).

insert into brands (name, slug, website_url) values
  ('GO SOLID!', 'go-solid', 'https://www.gosolid.nl'),
  ('Goobay', 'goobay', 'https://www.goobay.com')
on conflict (slug) do update set
  name = excluded.name,
  website_url = excluded.website_url;

insert into categories (name, slug, description) values
  (
    'Energie-accessoires',
    'energie-accessoires',
    'P1 meters, splitters, kabels, slimme stekkers en uitbreidingsbatterijen via affiliate.'
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description;

insert into products (
  brand_id, name, slug, summary, description, status, product_type,
  capacity_kwh, power_kw, cycles, warranty_years, expandable, image_path,
  indicative_price_min_cents, published_at
)
select
  b.id, v.name, v.slug, v.summary, v.description, 'published', 'accessory'::product_type,
  null, null, null, null, false, null, v.price_cents, now()
from (values
  ('homewizard', 'HomeWizard P1 Meter', 'homewizard-p1-meter',
   'Live inzicht in stroom, teruglevering en gas via de P1-poort.',
   'HomeWizard P1 Meter voor slimme meters. Alleen meten, geen batterij-aansturing.', 3499),
  ('go-solid', 'USB-C voeding voor P1 Meter', 'homewizard-p1-voeding',
   'Externe voeding voor oudere slimme meters, geschikt voor HomeWizard P1.',
   'GO SOLID USB-C oplader geschikt voor HomeWizard Wi-Fi P1 Meter. Geen officieel HomeWizard-merk.', 1995),
  ('homewizard', 'HomeWizard Energy Display', 'homewizard-energy-display',
   'Display voor verbruik, teruglevering en kosten in huis.',
   'HomeWizard Energy Display. Werkt met minimaal één HomeWizard Energy-product.', 6926),
  ('goobay', 'P1 verlengkabel 3 meter (RJ12)', 'p1-kabel-3m',
   'Universele RJ12-verlengkabel 3 meter voor P1-apparatuur.',
   'Goobay RJ12-verlengkabel, geschikt voor P1 Meter en splitters.', 629),
  ('goobay', 'P1 verlengkabel 5 meter (RJ12)', 'p1-kabel-5m',
   'Universele RJ12-verlengkabel 5 meter voor P1-apparatuur.',
   'Goobay RJ12-verlengkabel 5 meter.', 710),
  ('goobay', 'P1 verlengkabel 10 meter (RJ12)', 'p1-kabel-10m',
   'Universele RJ12-verlengkabel 10 meter voor P1-apparatuur.',
   'Goobay RJ12-verlengkabel 10 meter.', 1039),
  ('homewizard', 'HomeWizard Actieve P1 Splitter', 'homewizard-actieve-p1-splitter',
   'Drie geïsoleerde P1-poorten met signaalversterking.',
   'HomeWizard Actieve P1 Splitter voor gelijktijdig gebruik van meter, laadpaal en meer.', 3700),
  ('homewizard', 'HomeWizard Energy Socket', 'homewizard-energy-socket',
   'Meet en schakel apparaten tot 3680 W via de HomeWizard-app.',
   'HomeWizard Energy Socket voor meten en schakelen van stekkerapparaten.', 3650),
  ('zendure', 'Zendure AB3000X uitbreidingsbatterij', 'zendure-ab3000x',
   '2,88 kWh uitbreiding voor SolarFlow 2400 AC.',
   'Zendure AB3000X. Alleen compatibel met SolarFlow 2400 AC.', 74999),
  ('anker-solix', 'Anker SOLIX BP2700 Expansion', 'anker-solix-bp2700',
   '2,69 kWh uitbreiding voor Solarbank 3 E2700 Pro.',
   'Anker SOLIX BP2700. Niet compatibel met Solarbank 2 (BP1600).', 86600),
  ('anker-solix', 'Anker SOLIX BP3800 Expansion', 'anker-solix-bp3800',
   '3,84 kWh uitbreidingsmodule voor Anker SOLIX.',
   'Anker SOLIX BP3800 Expansion Battery. Controleer modelcompatibiliteit.', 149900),
  ('anker-solix', 'Anker SOLIX Power Dock', 'anker-solix-power-dock',
   'Accessoire voor Anker SOLIX energiebeheer.',
   'Anker SOLIX Power Dock accessoire.', 38400)
) as v(brand_slug, name, slug, summary, description, price_cents)
join brands b on b.slug = v.brand_slug
on conflict (slug) do update set
  brand_id = excluded.brand_id,
  name = excluded.name,
  summary = excluded.summary,
  description = excluded.description,
  status = 'published',
  product_type = 'accessory',
  indicative_price_min_cents = excluded.indicative_price_min_cents,
  deleted_at = null,
  updated_at = now();

insert into product_categories (product_id, category_id)
select p.id, c.id
from products p
cross join categories c
where c.slug = 'energie-accessoires'
  and p.slug in (
    'homewizard-p1-meter', 'homewizard-p1-voeding', 'homewizard-energy-display',
    'p1-kabel-3m', 'p1-kabel-5m', 'p1-kabel-10m',
    'homewizard-actieve-p1-splitter', 'homewizard-energy-socket',
    'zendure-ab3000x', 'anker-solix-bp2700', 'anker-solix-bp3800', 'anker-solix-power-dock'
  )
on conflict do nothing;

insert into offers (
  product_id, merchant_id, price_cents, stock_status, delivery_days,
  is_sponsored, affiliate_url, affiliate_deeplink, affiliate_network,
  affiliate_link_status, affiliate_link_note, last_checked_at
)
select
  p.id, m.id, v.price_cents, 'in_stock', 2, false,
  v.product_url, v.deeplink, 'bol-partner',
  'ok',
  'Slimme Energie Shop: bol product-URL geverifieerd 2026-07-20',
  now()
from (values
  (
    'homewizard-p1-meter', 3499,
    'https://www.bol.com/nl/nl/p/wi-fi-energie-monitor-p1-meter-inzicht-in-je-stroomverbruik-via-app/9300000005832994/',
    'https://partner.bol.com/click/click?p=2&t=url&s=1532194&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fp%2Fwi-fi-energie-monitor-p1-meter-inzicht-in-je-stroomverbruik-via-app%2F9300000005832994%2F'
  ),
  (
    'homewizard-p1-voeding', 1995,
    'https://www.bol.com/nl/nl/p/go-solid-oplader-geschikt-voor-homewizard-wi-fi-p1-meter/9300000197452613/',
    'https://partner.bol.com/click/click?p=2&t=url&s=1532194&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fp%2Fgo-solid-oplader-geschikt-voor-homewizard-wi-fi-p1-meter%2F9300000197452613%2F'
  ),
  (
    'homewizard-energy-display', 6926,
    'https://www.bol.com/nl/nl/p/homewizard-energy-display-brengt-jouw-energieverbruik-in-beeld/9300000162175512/',
    'https://partner.bol.com/click/click?p=2&t=url&s=1532194&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fp%2Fhomewizard-energy-display-brengt-jouw-energieverbruik-in-beeld%2F9300000162175512%2F'
  ),
  (
    'p1-kabel-3m', 629,
    'https://www.bol.com/nl/nl/p/goobay-telefoon-verlengkabel-rj12-rj12-zwart-3-meter/9200000019143783/',
    'https://partner.bol.com/click/click?p=2&t=url&s=1532194&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fp%2Fgoobay-telefoon-verlengkabel-rj12-rj12-zwart-3-meter%2F9200000019143783%2F'
  ),
  (
    'p1-kabel-5m', 710,
    'https://www.bol.com/nl/nl/p/rj12-rj12-telefoon-verlengkabel-zwart-5-meter/9200000019143663/',
    'https://partner.bol.com/click/click?p=2&t=url&s=1532194&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fp%2Frj12-rj12-telefoon-verlengkabel-zwart-5-meter%2F9200000019143663%2F'
  ),
  (
    'p1-kabel-10m', 1039,
    'https://www.bol.com/nl/nl/p/rj12-rj12-telefoon-verlengkabel-zwart-10-meter/9200000019144041/',
    'https://partner.bol.com/click/click?p=2&t=url&s=1532194&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fp%2Frj12-rj12-telefoon-verlengkabel-zwart-10-meter%2F9200000019144041%2F'
  ),
  (
    'homewizard-actieve-p1-splitter', 3700,
    'https://www.bol.com/nl/nl/p/actieve-p1-splitter/9300000082809573/',
    'https://partner.bol.com/click/click?p=2&t=url&s=1532194&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fp%2Factieve-p1-splitter%2F9300000082809573%2F'
  ),
  (
    'homewizard-energy-socket', 3650,
    'https://www.bol.com/nl/nl/p/homewizard-wi-fi-energy-socket/9300000123843037/',
    'https://partner.bol.com/click/click?p=2&t=url&s=1532194&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fp%2Fhomewizard-wi-fi-energy-socket%2F9300000123843037%2F'
  ),
  (
    'zendure-ab3000x', 74999,
    'https://www.bol.com/nl/nl/p/zendure-solarflow-2400-ac-ab3000x-2880wh-uitbreidingsbatterij/9300000237435925/',
    'https://partner.bol.com/click/click?p=2&t=url&s=1532194&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fp%2Fzendure-solarflow-2400-ac-ab3000x-2880wh-uitbreidingsbatterij%2F9300000237435925%2F'
  ),
  (
    'anker-solix-bp2700', 86600,
    'https://www.bol.com/nl/nl/p/anker-solix-bp2700-expansion-battery-2688wh-plug-and-play-compatibel-anker-solix-solarbank-3-e2700-pro/9300000233342583/',
    'https://partner.bol.com/click/click?p=2&t=url&s=1532194&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fp%2Fanker-solix-bp2700-expansion-battery-2688wh-plug-and-play-compatibel-anker-solix-solarbank-3-e2700-pro%2F9300000233342583%2F'
  ),
  (
    'anker-solix-bp3800', 149900,
    'https://www.bol.com/nl/nl/p/anker-solix-bp3800-extension-battery-3840wh/9300000171717051/',
    'https://partner.bol.com/click/click?p=2&t=url&s=1532194&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fp%2Fanker-solix-bp3800-extension-battery-3840wh%2F9300000171717051%2F'
  ),
  (
    'anker-solix-power-dock', 38400,
    'https://www.bol.com/nl/nl/p/anker-solix-power-dock-accessoire-slim-energiebeheer-uitbreidbare-functionaliteit-compact-ontwerp/9300000248613510/',
    'https://partner.bol.com/click/click?p=2&t=url&s=1532194&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fp%2Fanker-solix-power-dock-accessoire-slim-energiebeheer-uitbreidbare-functionaliteit-compact-ontwerp%2F9300000248613510%2F'
  )
) as v(pslug, price_cents, product_url, deeplink)
join products p on p.slug = v.pslug and p.deleted_at is null
cross join merchants m
where m.slug = 'bol'
on conflict (product_id, merchant_id) do update set
  price_cents = excluded.price_cents,
  affiliate_url = excluded.affiliate_url,
  affiliate_deeplink = excluded.affiliate_deeplink,
  affiliate_network = excluded.affiliate_network,
  affiliate_link_status = excluded.affiliate_link_status,
  affiliate_link_note = excluded.affiliate_link_note,
  deleted_at = null,
  last_checked_at = now(),
  updated_at = now();
