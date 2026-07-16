-- =========================================================================
-- 0017_daisycon_partner_links.sql
-- Daisycon-campagnes hebben naast een program_id (si) ook een link_id (li)
-- nodig om een werkende ds1.nl trackinglink te bouwen. Het link-ID komt uit
-- het Daisycon publisher-dashboard (Materiaal, Deeplinks) en verschilt per
-- campagne. Zonder link_id geen live Daisycon-deeplinks.
-- =========================================================================

alter table partner_programs add column if not exists link_id text;

comment on column partner_programs.link_id is
  'Daisycon li-parameter (link-ID) voor ds1.nl trackinglinks; per campagne uit het publisher-dashboard.';
