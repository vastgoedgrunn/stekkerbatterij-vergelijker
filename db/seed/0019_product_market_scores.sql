-- =========================================================================
-- 0019_seed_product_market_scores.sql
-- Externe marktscores per product (geverifieerd 2026-07-19).
-- Alleen citeerbare aggregates; Tesla/BYD auto-Trustpilot weggelaten.
-- =========================================================================

update products p set
  market_score_average = v.average,
  market_score_count = v.review_count,
  market_score_source_name = v.source_name,
  market_score_source_url = v.source_url,
  market_score_scope = v.scope::market_score_scope,
  market_score_checked_at = timestamptz '2026-07-19 12:00:00+00',
  updated_at = now()
from (values
  ('anker-solix-solarbank-2-e1600', 4.1, 215, 'Trustpilot', 'https://www.trustpilot.com/review/ankersolix.com', 'brand'),
  ('anker-solix-solarbank-2-e1600-pro', 4.4, 118, 'Amazon.de', 'https://www.amazon.de/dp/B0D1X82HDL', 'sku'),
  ('ecoflow-powerstream-800', 4.5, 402, 'Amazon.de', 'https://www.amazon.de/dp/B0C49HY214', 'sku'),
  ('ecoflow-stream-ac-pro', 4.3, 172, 'Amazon.de', 'https://www.amazon.de/dp/B0F5B1T5LK', 'sku'),
  ('growatt-noah-2000', 4.0, 260, 'Amazon.de', 'https://www.amazon.de/dp/B0DC447JCB', 'sku'),
  ('growatt-noah-2000s', 4.0, 1262, 'Trustpilot', 'https://www.trustpilot.com/review/www.growatt.com', 'brand'),
  ('homewizard-plug-in-battery', 3.7, 2237, 'Trustpilot', 'https://nl.trustpilot.com/review/homewizard.com', 'brand'),
  ('homewizard-plug-in-battery-bundle', 3.7, 2237, 'Trustpilot', 'https://nl.trustpilot.com/review/homewizard.com', 'brand'),
  ('marstek-jupiter-c-1024', 2.8, 59, 'Trustpilot', 'https://www.trustpilot.com/review/marstek.nl', 'brand'),
  ('marstek-venus-512', 2.8, 59, 'Trustpilot', 'https://www.trustpilot.com/review/marstek.nl', 'brand'),
  ('sessy-thuisbatterij', 4.5, 141, 'Trustindex', 'https://www.trustindex.io/reviews/www.sessy.nl', 'brand'),
  ('sessy-thuisbatterij-duo', 4.5, 141, 'Trustindex', 'https://www.trustindex.io/reviews/www.sessy.nl', 'brand'),
  ('sunology-play', 4.7, 3078, 'Trustpilot', 'https://www.trustpilot.com/review/sunology.eu', 'brand'),
  ('sunology-storey', 4.7, 3078, 'Trustpilot', 'https://www.trustpilot.com/review/sunology.eu', 'brand'),
  ('zendure-solarflow-800', 4.7, 400, 'Trustpilot', 'https://www.trustpilot.com/review/zendure.de', 'brand'),
  ('zendure-solarflow-hyper-2000', 4.5, 293, 'Amazon.de', 'https://www.amazon.de/dp/B0DNK3KDRF', 'sku'),
  ('huawei-luna2000-10-s0', 2.3, 14, 'Trustpilot', 'https://www.trustpilot.com/review/solar.huawei.com', 'brand'),
  ('solaredge-home-battery-10', 3.6, 3859, 'Trustpilot', 'https://www.trustpilot.com/review/www.solaredge.com', 'brand'),
  ('enphase-iq-battery-5p', 3.7, 482, 'Trustpilot', 'https://www.trustpilot.com/review/enphase.com', 'brand'),
  ('sigenergy-sigenstor-10', 2.9, 67, 'Trustpilot', 'https://www.trustpilot.com/review/sigenergy.com', 'brand'),
  ('sonnen-eco-8', 3.2, 3271, 'Trustpilot', 'https://de.trustpilot.com/review/sonnen.de', 'brand'),
  ('foxess-ecs-10-4', 1.9, 42, 'Trustpilot', 'https://www.trustpilot.com/review/www.fox-ess.com', 'brand'),
  ('alphaess-smile-t10', 3.9, 381, 'Trustpilot', 'https://nl-be.trustpilot.com/review/alphaess.be', 'brand'),
  ('alphaess-smile-b3', 3.9, 381, 'Trustpilot', 'https://nl-be.trustpilot.com/review/alphaess.be', 'brand')
) as v(slug, average, review_count, source_name, source_url, scope)
where p.slug = v.slug
  and p.deleted_at is null;

-- Tesla Powerwall / BYD Battery-Box: geen betrouwbare product- of energy-only score
-- (Tesla.com/BYD.com Trustpilot is vooral auto/service). Blijven leeg.
