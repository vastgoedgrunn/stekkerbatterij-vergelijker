-- Bestaande outbound-offers die exact op SKU, titel en prijs zijn gecontroleerd.
-- Idempotent. Nieuwe offers en prijsafwijkingen blijven buiten deze update.

update offers o
set
  affiliate_link_status = 'ok',
  affiliate_link_checked_at = '2026-07-15T21:50:00Z'::timestamptz,
  affiliate_link_note = 'Exacte SKU-match: merchanttitel Marstek Venus Thuisbatterij, prijs EUR 1210,00.',
  last_checked_at = '2026-07-15T21:50:00Z'::timestamptz,
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and o.deleted_at is null
  and p.slug = 'marstek-venus-512'
  and m.slug = 'bol'
  and o.price_cents = 121000
  and (
    coalesce(o.affiliate_deeplink, '') like '%9300000185746060%'
    or coalesce(o.affiliate_url, '') like '%9300000185746060%'
  );
