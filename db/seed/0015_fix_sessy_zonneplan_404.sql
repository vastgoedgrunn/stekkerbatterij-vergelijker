-- P0: Sessy↔Zonneplan URL gaf 404. Soft-delete die offers.
update offers o
set
  deleted_at = coalesce(o.deleted_at, now()),
  affiliate_link_status = 'broken',
  affiliate_link_note = 'P0 dead link: zonneplan.nl/thuisbatterij/sessy geeft 404',
  affiliate_url = null,
  affiliate_deeplink = null,
  affiliate_link_checked_at = now(),
  updated_at = now()
from products p, merchants m
where o.product_id = p.id
  and o.merchant_id = m.id
  and m.slug = 'zonneplan'
  and p.slug in ('sessy-thuisbatterij', 'sessy-thuisbatterij-duo');
