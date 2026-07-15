-- Point each published product at its unique slug asset under /public/images/products.
-- Binary assets ship in the same PR; run after deploy or rely on seed upsert.
update products as p
set
  image_path = v.path,
  updated_at = now()
from (
  values
    ('anker-solix-solarbank-2-e1600', '/images/products/anker-solix-solarbank-2-e1600.jpg'),
    ('anker-solix-solarbank-2-e1600-pro', '/images/products/anker-solix-solarbank-2-e1600-pro.jpg'),
    ('ecoflow-powerstream-800', '/images/products/ecoflow-powerstream-800.jpg'),
    ('ecoflow-stream-ac-pro', '/images/products/ecoflow-stream-ac-pro.jpg'),
    ('growatt-noah-2000', '/images/products/growatt-noah-2000.jpg'),
    ('growatt-noah-2000s', '/images/products/growatt-noah-2000s.jpg'),
    ('homewizard-plug-in-battery', '/images/products/homewizard-plug-in-battery.jpg'),
    ('homewizard-plug-in-battery-bundle', '/images/products/homewizard-plug-in-battery-bundle.jpg'),
    ('marstek-jupiter-c-1024', '/images/products/marstek-jupiter-c-1024.jpg'),
    ('marstek-venus-512', '/images/products/marstek-venus-512.jpg'),
    ('sessy-thuisbatterij', '/images/products/sessy-thuisbatterij.jpg'),
    ('sessy-thuisbatterij-duo', '/images/products/sessy-thuisbatterij-duo.jpg'),
    ('sunology-play', '/images/products/sunology-play.jpg'),
    ('sunology-storey', '/images/products/sunology-storey.jpg'),
    ('zendure-solarflow-800', '/images/products/zendure-solarflow-800.jpg'),
    ('zendure-solarflow-hyper-2000', '/images/products/zendure-solarflow-hyper-2000.jpg')
) as v(slug, path)
where p.slug = v.slug
  and p.deleted_at is null;
