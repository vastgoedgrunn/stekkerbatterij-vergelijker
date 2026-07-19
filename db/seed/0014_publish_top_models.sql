-- =========================================================================
-- 0014_publish_top_models.sql — Publiceer de 7 top-modellen na Slack-approve
-- Owner-approve (price-fact-verification gate): 1-klik :white_check_mark: in
-- #all-stekkerbatterij-vergelijker op 2026-07-15 (Rick Schlimback).
-- Bron-post: catalogus "7 draft top-modellen klaar om te publiceren".
-- Zet de draft-SKUs uit 0013_top_models_draft.sql op status=published.
-- Prijzen/URLs blijven indicatief (offers.affiliate_link_status=pending) tot
-- Bol/Awin/Daisycon-deeplinks geverifieerd zijn.
-- =========================================================================

update products
set status = 'published',
    published_at = coalesce(published_at, now()),
    updated_at = now()
where status = 'draft'
  and slug in (
    'zendure-solarflow-hyper-2000',
    'ecoflow-stream-ac-pro',
    'anker-solix-solarbank-2-e1600-pro',
    'growatt-noah-2000s',
    'sunology-play',
    'sessy-thuisbatterij-duo',
    'homewizard-plug-in-battery-bundle'
  );
