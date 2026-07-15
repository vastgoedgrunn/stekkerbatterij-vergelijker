-- =========================================================================
-- 0012_affiliate_link_health.sql — Hybrid affiliate: pending/broken tracking
-- =========================================================================

do $$ begin
  create type affiliate_link_status as enum ('ok', 'pending', 'broken');
exception when duplicate_object then null; end $$;

alter table offers
  add column if not exists affiliate_link_status affiliate_link_status not null default 'pending';

alter table offers
  add column if not exists affiliate_link_checked_at timestamptz;

alter table offers
  add column if not exists affiliate_link_note text;

comment on column offers.affiliate_link_status is
  'ok = werkende deeplink/url; pending = netwerk/deeplink nog niet live; broken = check faalde';

-- Bestaande rijen met een http(s) deeplink of affiliate_url → ok (best effort).
update offers
set affiliate_link_status = 'ok'
where deleted_at is null
  and (
    (affiliate_deeplink is not null and affiliate_deeplink ~* '^https://')
    or (affiliate_url is not null and affiliate_url ~* '^https://' and affiliate_url !~* '^https://www\.bol\.com/?$')
  );

-- Te generieke bol-homepage of lege outbound → pending.
update offers
set affiliate_link_status = 'pending',
    affiliate_link_note = 'Geen product-specifieke affiliate-URL; vul deeplink zodra netwerk live is.'
where deleted_at is null
  and affiliate_link_status = 'ok'
  and (
    affiliate_deeplink is null
    or length(trim(affiliate_deeplink)) = 0
  )
  and (
    affiliate_url is null
    or length(trim(affiliate_url)) = 0
    or affiliate_url ~* '^https://www\.bol\.com/?$'
    or affiliate_url ~* '^https://solarsale\.nl/?$'
    or affiliate_url ~* '^https://www\.coolblue\.nl/?$'
  );
