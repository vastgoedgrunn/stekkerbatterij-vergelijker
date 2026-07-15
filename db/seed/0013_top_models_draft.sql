-- =========================================================================
-- 0013_top_models_draft.sql — Extra top-modellen (draft tot Slack-approve)
-- Bronnen ter verificatie: fabrikant/retailerpagina's; prijzen zijn indicatief.
-- Publiceer pas na 1-klik Slack-approve (price-fact-verification gate).
-- =========================================================================

insert into products (brand_id, name, slug, summary, description, status, capacity_kwh, power_kw, cycles, warranty_years, expandable, image_path, published_at)
select b.id, v.name, v.slug, v.summary, v.description, 'draft', v.capacity, v.power, v.cycles, v.warranty, v.expandable, v.image_path, null
from (values
  ('zendure', 'Zendure SolarFlow Hyper 2000', 'zendure-solarflow-hyper-2000',
   'Bidirectionele plug-and-play hub voor balkonpanelen en slimme teruglevering.',
   'De Zendure SolarFlow Hyper 2000 is een bidirectionele stekkerhub die zonne-energie van balkonpanelen opslaat en slim teruglevert. Modulair uitbreidbaar met batterijmodules.',
   1.92, 1.2, 6000, 10, true, '/images/products/zendure-solarflow.png'),
  ('ecoflow', 'EcoFlow STREAM AC Pro', 'ecoflow-stream-ac-pro',
   'Modulaire stekkerbatterij voor huishoudens die willen groeien in capaciteit.',
   'EcoFlow STREAM AC Pro is een plug-and-play thuisbatterij met app-sturing, geschikt voor zelfverbruik en dynamische tarieven. Modulair uitbreidbaar.',
   2.0, 0.8, 6000, 10, true, '/images/products/ecoflow-powerstream.png'),
  ('anker-solix', 'Anker SOLIX Solarbank 2 E1600 Pro', 'anker-solix-solarbank-2-e1600-pro',
   'Uitbreidbare balkonbatterij met geïntegreerde omvormer en app-sturing.',
   'De Anker SOLIX Solarbank 2 E1600 Pro bouwt voort op de E1600 met meer stuurmogelijkheden en uitbreidbare capaciteit via extra batterijmodules.',
   1.6, 0.8, 6000, 10, true, '/images/products/anker-solix.png'),
  ('growatt', 'Growatt NOAH 2000S', 'growatt-noah-2000s',
   'Gestapelde balkonbatterij-module in het NOAH-ecosysteem.',
   'Growatt NOAH 2000S is een modulaire stekkerbatterij die je kunt stapelen om capaciteit op te bouwen, bedoeld voor balkon- en thuisopstellingen.',
   2.048, 0.8, 6000, 10, true, '/images/products/growatt-noah.png'),
  ('sunology', 'Sunology PLAY', 'sunology-play',
   'Compacte plug-and-play batterij voor kleinere huishoudens en balkons.',
   'Sunology PLAY is een toegankelijke stekkerbatterij gericht op eenvoudige installatie zonder installateur, met app-bediening voor dagelijks gebruik.',
   1.2, 0.8, 4000, 5, false, '/images/products/growatt-noah.png'),
  ('sessy', 'Sessy Thuisbatterij Duo', 'sessy-thuisbatterij-duo',
   'Twee gekoppelde Sessy-units voor grotere huishoudens met dynamisch contract.',
   'De Sessy Duo-configuratie koppelt twee Sessy-units voor meer opslag en handel op de energiemarkt. Geschikt wanneer één unit te klein is voor je verbruik.',
   10.0, 4.4, 6000, 10, true, '/images/products/sessy-thuisbatterij.png'),
  ('homewizard', 'HomeWizard Plug-In Battery Bundle', 'homewizard-plug-in-battery-bundle',
   'Uitbreidbare HomeWizard-opstelling met extra batterijmodule voor meer capaciteit.',
   'Het HomeWizard Plug-In Battery Bundle combineert de basisunit met een extra module voor meer opslag, volledig geïntegreerd in de HomeWizard-app en P1-sturing.',
   5.4, 0.8, 6000, 10, true, '/images/products/homewizard-battery.png')
) as v(brand_slug, name, slug, summary, description, capacity, power, cycles, warranty, expandable, image_path)
join brands b on b.slug = v.brand_slug
on conflict (slug) do update set
  name = excluded.name,
  summary = excluded.summary,
  description = excluded.description,
  capacity_kwh = excluded.capacity_kwh,
  power_kw = excluded.power_kw,
  cycles = excluded.cycles,
  warranty_years = excluded.warranty_years,
  expandable = excluded.expandable,
  image_path = excluded.image_path,
  updated_at = now();

insert into offers (
  product_id, merchant_id, price_cents, currency, stock_status, delivery_days,
  affiliate_url, affiliate_network, affiliate_link_status, affiliate_link_note, is_sponsored, last_checked_at
)
select p.id, m.id, v.price_cents, 'EUR', 'in_stock', 3, v.affiliate_url, v.network, 'pending',
  'Nieuwe SKU: prijs/URL ter verificatie. Deeplink vullen zodra Bol/Awin/Daisycon live is.',
  false, now()
from (values
  ('zendure-solarflow-hyper-2000', 'bol', 89900, 'https://www.bol.com/nl/nl/s/?searchtext=zendure+solarflow+hyper', 'bol-partner'),
  ('zendure-solarflow-hyper-2000', 'coolblue', 94900, 'https://www.coolblue.nl/zoeken?query=zendure%20solarflow', 'awin'),
  ('ecoflow-stream-ac-pro', 'bol', 109900, 'https://www.bol.com/nl/nl/p/ecoflow-stream-ac-pro-thuisbatterij/9300000232241116/', 'bol-partner'),
  ('ecoflow-stream-ac-pro', 'solar-sale', 114900, 'https://solarsale.nl/?s=ecoflow+stream', 'daisycon'),
  ('anker-solix-solarbank-2-e1600-pro', 'bol', 79900, 'https://www.bol.com/nl/nl/s/?searchtext=anker+solix+solarbank+2+pro', 'bol-partner'),
  ('anker-solix-solarbank-2-e1600-pro', 'coolblue', 84900, 'https://www.coolblue.nl/zoeken?query=anker%20solix%20solarbank', 'awin'),
  ('growatt-noah-2000s', 'solar-sale', 99900, 'https://solarsale.nl/?s=growatt+noah', 'daisycon'),
  ('growatt-noah-2000s', 'bol', 104900, 'https://www.bol.com/nl/nl/s/?searchtext=growatt+noah', 'bol-partner'),
  ('sunology-play', 'bol', 69900, 'https://www.bol.com/nl/nl/s/?searchtext=sunology+play', 'bol-partner'),
  ('sessy-thuisbatterij-duo', 'zonneplan', 319900, 'https://zonneplan.nl/thuisbatterij/sessy', 'daisycon'),
  ('homewizard-plug-in-battery-bundle', 'coolblue', 229900, 'https://www.coolblue.nl/zoeken?query=homewizard%20plug-in%20battery', 'awin'),
  ('homewizard-plug-in-battery-bundle', 'bol', 219900, 'https://www.bol.com/nl/nl/s/?searchtext=homewizard+plug-in+battery', 'bol-partner')
) as v(product_slug, merchant_slug, price_cents, affiliate_url, network)
join products p on p.slug = v.product_slug
join merchants m on m.slug = v.merchant_slug
where not exists (
  select 1 from offers o
  where o.product_id = p.id and o.merchant_id = m.id and o.deleted_at is null
);
