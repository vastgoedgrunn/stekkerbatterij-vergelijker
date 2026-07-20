/**
 * Lokale productfoto’s onder /public als fallback wanneer image_path leeg is
 * of Storage nog niet gevuld is. Gedeeld door catalogus-reads en image-refresh.
 */
export const LOCAL_PRODUCT_IMAGE_PATHS: Record<string, string> = {
  "anker-solix-solarbank-2-e1600": "/images/products/anker-solix-solarbank-2-e1600.jpg",
  "anker-solix-solarbank-2-e1600-pro": "/images/products/anker-solix-solarbank-2-e1600-pro.jpg",
  "ecoflow-powerstream-800": "/images/products/ecoflow-powerstream-800.jpg",
  "ecoflow-stream-ac-pro": "/images/products/ecoflow-stream-ac-pro.jpg",
  "growatt-noah-2000": "/images/products/growatt-noah-2000.jpg",
  "growatt-noah-2000s": "/images/products/growatt-noah-2000s.jpg",
  "homewizard-plug-in-battery": "/images/products/homewizard-plug-in-battery.jpg",
  "homewizard-plug-in-battery-bundle": "/images/products/homewizard-plug-in-battery-bundle.jpg",
  "marstek-jupiter-c-1024": "/images/products/marstek-jupiter-c-1024.jpg",
  "marstek-venus-512": "/images/products/marstek-venus-512.jpg",
  "sessy-thuisbatterij": "/images/products/sessy-thuisbatterij.jpg",
  "sessy-thuisbatterij-duo": "/images/products/sessy-thuisbatterij-duo.jpg",
  "sunology-play": "/images/products/sunology-play.jpg",
  "sunology-storey": "/images/products/sunology-storey.jpg",
  "zendure-solarflow-800": "/images/products/zendure-solarflow-800.jpg",
  "zendure-solarflow-hyper-2000": "/images/products/zendure-solarflow-hyper-2000.jpg",
  // Vaste thuisbatterijen
  "alphaess-smile-b3": "/images/products/alphaess-smile-b3.jpg",
  "alphaess-smile-t10": "/images/products/alphaess-smile-t10.jpg",
  "byd-battery-box-premium-hvs-10-2": "/images/products/byd-battery-box-premium-hvs-10-2.jpg",
  "enphase-iq-battery-5p": "/images/products/enphase-iq-battery-5p.jpg",
  "foxess-ecs-10-4": "/images/products/foxess-ecs-10-4.jpg",
  "huawei-luna2000-10-s0": "/images/products/huawei-luna2000-10-s0.jpg",
  "sigenergy-sigenstor-10": "/images/products/sigenergy-sigenstor-10.jpg",
  "solaredge-home-battery-10": "/images/products/solaredge-home-battery-10.jpg",
  "sonnen-eco-8": "/images/products/sonnen-eco-8.jpg",
  "tesla-powerwall-3": "/images/products/tesla-powerwall-3.jpg",
  // Shop-accessoires
  "homewizard-p1-meter": "/images/shop/homewizard-p1-meter.jpg",
  "homewizard-p1-voeding": "/images/shop/homewizard-p1-voeding.jpg",
  "homewizard-energy-display": "/images/shop/homewizard-energy-display.jpg",
  "p1-kabel-3m": "/images/shop/p1-kabel-3m.jpg",
  "p1-kabel-5m": "/images/shop/p1-kabel-5m.jpg",
  "p1-kabel-10m": "/images/shop/p1-kabel-10m.jpg",
  "homewizard-actieve-p1-splitter": "/images/shop/homewizard-actieve-p1-splitter.jpg",
  "homewizard-energy-socket": "/images/shop/homewizard-energy-socket.jpg",
  "zendure-ab3000x": "/images/shop/zendure-ab3000x.jpg",
  "anker-solix-bp2700": "/images/shop/anker-solix-bp2700.jpg",
  "anker-solix-bp3800": "/images/shop/anker-solix-bp3800.jpg",
  "anker-solix-power-dock": "/images/shop/anker-solix-power-dock.jpg",
};

/** DB-pad behouden; anders lokale slug-asset. */
export function resolveProductImagePath(slug: string, imagePath: string | null): string | null {
  if (imagePath) return imagePath;
  return LOCAL_PRODUCT_IMAGE_PATHS[slug] ?? null;
}
