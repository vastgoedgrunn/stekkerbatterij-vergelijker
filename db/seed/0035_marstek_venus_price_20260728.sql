-- Marstek Venus E 3.0 prijsrefresh.
-- Bron: https://www.bol.com/nl/nl/p/marstek-venus-e-3-0-5-12kwh-plug-play-thuisbatterij-via-230v-stopcontact/9300000240523865/
-- Brontitel: Marstek Venus E 3.0 inclusief P1 meter, 5,12kWh Plug & Play Thuisbatterij.
-- Gecontroleerd: 2026-07-28 om 05:25 UTC, EUR 1.385,00.
-- Publieke catalogusprijs vooraf: EUR 1.300,00. Verschil: +6,54%.
-- De prijstrigger schrijft de wijziging append-only naar price_history.

update offers o
set
  price_cents = 138500,
  stock_status = 'in_stock',
  affiliate_link_note = 'Bol product 9300000240523865, Marstek Venus E 3.0 5,12kWh inclusief P1 meter, EUR 1385, gecheckt 2026-07-28',
  affiliate_link_checked_at = now(),
  last_checked_at = now(),
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and m.slug = 'bol'
  and m.deleted_at is null
  and p.slug = 'marstek-venus-512'
  and p.deleted_at is null
  and o.deleted_at is null
  and o.price_cents > 0
  and abs(138500 - o.price_cents)::numeric / o.price_cents <= 0.10;
