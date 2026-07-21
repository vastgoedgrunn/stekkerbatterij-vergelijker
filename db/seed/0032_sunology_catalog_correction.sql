-- Sunology cataloguscorrectie.
-- Gecontroleerd: 2026-07-21T06:02:00Z.
-- STOREY bron: https://sunology.eu/products/storey-batterie-stockage-plug-play
-- PLAY bron: https://sunology.eu/products/sunology-play
--
-- De STOREY bron vermeldt voor het Master Pack 2200 Wh, 500 W, IP64,
-- 30,5 kg, 7500 cycli, 15 jaar garantie en EUR 1390. De prijswijziging wordt door
-- t_offers_price append-only aan price_history toegevoegd.
--
-- De bestaande PLAY URL opent nu een PLAY2 zonnepaneelset zonder batterij.
-- Daarom gaat het onjuiste product terug naar draft en wordt de CTA
-- soft-deleted. Publiceer pas opnieuw met een geverifieerde batterij-SKU.

update products
set
  status = 'draft',
  published_at = null,
  updated_at = now()
where slug = 'sunology-play'
  and deleted_at is null;

update offers o
set
  stock_status = 'out_of_stock',
  affiliate_link_status = 'broken',
  affiliate_link_note = 'P0: product-URL opent PLAY2 zonnepaneelset zonder batterij; gecheckt 2026-07-21T06:02:00Z',
  affiliate_link_checked_at = '2026-07-21T06:02:00Z'::timestamptz,
  last_checked_at = '2026-07-21T06:02:00Z'::timestamptz,
  deleted_at = coalesce(o.deleted_at, now()),
  updated_at = now()
from products p
cross join merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'sunology-play'
  and m.slug = 'sunology';

update products
set
  name = 'Sunology STOREY',
  summary = 'Uitbreidbare plug-in batterij met 2,2 kWh opslag en 500 W vermogen per module.',
  description = 'Sunology STOREY slaat zonnestroom of voordelige netstroom op en levert die later terug. Het Master Pack heeft 2,2 kWh capaciteit en is uitbreidbaar met extra modules.',
  capacity_kwh = 2.2,
  power_kw = 0.5,
  cycles = 7500,
  warranty_years = 15,
  expandable = true,
  indicative_price_min_cents = 139000,
  updated_at = now()
where slug = 'sunology-storey'
  and deleted_at is null;

update product_specs ps
set value_number = v.value_number
from products p
cross join spec_definitions sd
cross join (values
    ('inverter_w', 500::numeric),
    ('weight_kg', 30.5::numeric)
  ) as v(spec_key, value_number)
where ps.product_id = p.id
  and ps.spec_id = sd.id
  and p.slug = 'sunology-storey'
  and sd.key = v.spec_key;

update product_specs ps
set value_text = 'IP64'
from products p
cross join spec_definitions sd
where ps.product_id = p.id
  and ps.spec_id = sd.id
  and p.slug = 'sunology-storey'
  and sd.key = 'ip_rating';

update offers o
set
  price_cents = 139000,
  stock_status = 'in_stock',
  affiliate_url = 'https://sunology.eu/products/storey-batterie-stockage-plug-play',
  affiliate_link_status = 'ok',
  affiliate_link_note = 'Officiele STOREY bron: EUR 1390; gecheckt 2026-07-21T06:02:00Z',
  affiliate_link_checked_at = '2026-07-21T06:02:00Z'::timestamptz,
  last_checked_at = '2026-07-21T06:02:00Z'::timestamptz,
  deleted_at = null,
  updated_at = now()
from products p
cross join merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and p.slug = 'sunology-storey'
  and m.slug = 'sunology';
