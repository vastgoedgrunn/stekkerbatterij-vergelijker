-- =========================================================================
-- 0019_alphaess_fixed_batteries.sql
-- AlphaESS vaste thuisbatterijen (veel geinstalleerd in NL).
-- Draft tot Image OS image_status=ok zet; daarna pas publish (geen lege kaarten).
-- Geen indicative prices hier: die gaan via price-fact-verification (🔒).
-- =========================================================================

insert into brands (name, slug, website_url) values
  ('AlphaESS', 'alphaess', 'https://www.alphaess.com')
on conflict (slug) do update set name = excluded.name, website_url = excluded.website_url;

insert into products (
  brand_id, name, slug, summary, description, status,
  capacity_kwh, power_kw, cycles, warranty_years, expandable, image_path,
  image_status, product_type, published_at
)
select
  b.id, v.name, v.slug, v.summary, v.description, 'draft',
  v.capacity, v.power, v.cycles, v.warranty, v.expandable, null,
  'pending'::product_image_status, 'fixed'::product_type, null
from (values
  (
    'alphaess',
    'AlphaESS SMILE-T10',
    'alphaess-smile-t10',
    'Driefasige hybride thuisbatterij, veelgebruikt door Nederlandse installateurs.',
    'De AlphaESS SMILE-T10 is een hybride energieopslagsysteem voor woningen met zonnepanelen. Capaciteit rond 10 kWh-klasse afhankelijk van batterijmodules. Installatie en inregeling door een gecertificeerde installateur.',
    10.0, 10.0, 6000, 10, true
  ),
  (
    'alphaess',
    'AlphaESS SMILE-B3',
    'alphaess-smile-b3',
    'Compacte modulaire thuisbatterij voor eenfasige aansluitingen.',
    'De AlphaESS SMILE-B3 is een schaalbaar eenfasig opslagsysteem. Geschikt voor kleinere woningen of als startconfiguratie die later uit te breiden is. Professionele installatie vereist.',
    3.0, 3.0, 6000, 10, true
  )
) as v(brand_slug, name, slug, summary, description, capacity, power, cycles, warranty, expandable)
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
  product_type = excluded.product_type,
  updated_at = now();

insert into product_categories (product_id, category_id)
select p.id, c.id
from products p
join categories c on c.slug = 'vaste-thuisbatterijen'
where p.slug in ('alphaess-smile-t10', 'alphaess-smile-b3')
on conflict do nothing;
