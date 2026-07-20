-- Bol Partner commissie 7,5% CPS (owner-confirmed 2026-07-20).
-- Was eerder 2,5% in seeds; corrigeer partner_programs + alle live Bol-offers.

update partner_programs
set
  commission_type = 'cps',
  commission_rate = 0.075,
  updated_at = now()
where slug = 'bol-partner';

update offers o
set
  commission_type = 'cps',
  commission_rate = 0.075,
  commission_cents_fixed = null,
  commission_source_url = 'https://affiliate.bol.com/',
  last_commission_verified_at = now(),
  updated_at = now()
from merchants m
where o.merchant_id = m.id
  and m.slug = 'bol'
  and o.deleted_at is null;
