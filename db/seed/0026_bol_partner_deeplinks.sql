-- Backfill bol partner-deeplinks met site-ID 1532194.
-- Live DB had Anker Pro / EcoFlow Stream AC Pro / Marstek Venus al correct;
-- deze seed houdt lokale/dev seeds synchroon. Runtime wrap: ensureBolPartnerDeeplink.

update offers o
set
  affiliate_deeplink = v.deeplink,
  affiliate_url = v.product_url,
  affiliate_network = 'bol-partner',
  affiliate_link_status = 'ok',
  affiliate_link_note = 'bol partner-deeplink site-ID 1532194',
  last_checked_at = now(),
  updated_at = now()
from (
  values
    (
      'anker-solix-solarbank-2-e1600-pro',
      'https://www.bol.com/nl/nl/p/anker-solix-solarbank-2-e1600-pro/9300000185730379/',
      'https://partner.bol.com/click/click?p=2&t=url&s=1532194&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fp%2Fanker-solix-solarbank-2-e1600-pro%2F9300000185730379%2F'
    ),
    (
      'ecoflow-stream-ac-pro',
      'https://www.bol.com/nl/nl/p/ecoflow-stream-ac-pro-thuisbatterij/9300000232241116/',
      'https://partner.bol.com/click/click?p=2&t=url&s=1532194&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fp%2Fecoflow-stream-ac-pro-thuisbatterij%2F9300000232241116%2F'
    ),
    (
      'marstek-venus-512',
      'https://www.bol.com/nl/nl/p/marstek-venus-e-3-0-5-12kwh-plug-play-thuisbatterij-via-230v-stopcontact/9300000240523865/',
      'https://partner.bol.com/click/click?p=2&t=url&s=1532194&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fp%2Fmarstek-venus-e-3-0-5-12kwh-plug-play-thuisbatterij-via-230v-stopcontact%2F9300000240523865%2F'
    )
) as v(product_slug, product_url, deeplink)
join products p on p.slug = v.product_slug
join merchants m on m.slug = 'bol'
where o.product_id = p.id
  and o.merchant_id = m.id
  and o.deleted_at is null;

update partner_programs
set name = 'bol Partner', updated_at = now()
where slug = 'bol-partner';
