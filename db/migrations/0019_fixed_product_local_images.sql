-- Vaste thuisbatterijen: wissel van Supabase Storage (catalog/*) naar lokale
-- studio-cutouts onder /public/images/products, gelijk aan stekkerbatterijen.
update products as p
set
  image_path = v.path,
  updated_at = now()
from (
  values
    ('tesla-powerwall-3', '/images/products/tesla-powerwall-3.jpg'),
    ('byd-battery-box-premium-hvs-10-2', '/images/products/byd-battery-box-premium-hvs-10-2.jpg'),
    ('huawei-luna2000-10-s0', '/images/products/huawei-luna2000-10-s0.jpg'),
    ('solaredge-home-battery-10', '/images/products/solaredge-home-battery-10.jpg'),
    ('enphase-iq-battery-5p', '/images/products/enphase-iq-battery-5p.jpg'),
    ('sigenergy-sigenstor-10', '/images/products/sigenergy-sigenstor-10.jpg'),
    ('sonnen-eco-8', '/images/products/sonnen-eco-8.jpg'),
    ('foxess-ecs-10-4', '/images/products/foxess-ecs-10-4.jpg'),
    ('alphaess-smile-b3', '/images/products/alphaess-smile-b3.jpg'),
    ('alphaess-smile-t10', '/images/products/alphaess-smile-t10.jpg')
) as v(slug, path)
where p.slug = v.slug
  and p.deleted_at is null;
