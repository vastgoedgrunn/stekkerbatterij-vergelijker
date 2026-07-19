/**
 * Gecureerde bronfoto's (fabrikant/merchant) voor Image OS.
 * Alleen echte productshots, geen logos. Uniek per slug.
 */
export const CURATED_PRODUCT_IMAGE_SOURCES: Record<string, string> = {
  "anker-solix-solarbank-2-e1600":
    "https://cdn.shopify.com/s/files/1/0491/8227/7795/files/Anker_SOLIX_Solarbank_2_E1600_AC_SG_PT_cb.de_14112024.jpg?v=1732704937",
  "anker-solix-solarbank-2-e1600-pro": "https://media.s-bol.com/m4XA0LnNw9kn/1j4x4jG/550x308.jpg",
  "ecoflow-powerstream-800":
    "https://eu.ecoflow.com/cdn/shop/files/ecoflow-powerstream-microinverter-53568681312599.png?v=1699882644",
  "ecoflow-stream-ac-pro": "https://media.s-bol.com/ZBAAV8y5oG3J/r02o9gk/550x800.jpg",
  "homewizard-plug-in-battery":
    "https://www.homewizard.com/wp-content/uploads/2024/06/HomeWIzard-plugin-battery-featured-image.jpg",
  "homewizard-plug-in-battery-bundle":
    "https://cdn.shopify.com/s/files/1/0550/5312/3661/files/P1_Battery.png?v=1717500000",
  "marstek-jupiter-c-1024":
    "https://eu.marstekenergy.com/cdn/shop/files/Marstek_Jupiter_All-in-one.jpg?v=1733794244",
  "marstek-venus-512":
    "https://eu.marstekenergy.com/cdn/shop/files/1_8_7c5516ee-a80b-47e1-bab8-35ea0718a0f0.jpg?v=1773985845",
  "sessy-thuisbatterij": "https://www.sessy.nl/wp-content/uploads/2025/08/render-scaled.png",
  "sessy-thuisbatterij-duo":
    "https://www.sessy.nl/wp-content/uploads/2024/06/Sessy-thuisbatterij-duo.png",
  "sunology-play":
    "https://cdn.shopify.com/s/files/1/0469/0165/7754/files/PLAY-480.webp?v=1772742039",
  "sunology-storey":
    "https://cdn.shopify.com/s/files/1/0469/0165/7754/files/sunology-storey-feature-image.webp?v=1742485702",
  "zendure-solarflow-800":
    "https://zendure.com/cdn/shop/files/solarflow-800-with-ac-cable.png?v=1740455072",
  "zendure-solarflow-hyper-2000":
    "https://zendure.com/cdn/shop/files/ZDHYP2000-1AB2000X-png.png?v=1743509454",
  "growatt-noah-2000":
    "https://www.growatt.com/upload/image/202405/noah-2000.png",
  "growatt-noah-2000s":
    "https://www.growatt.com/upload/image/202405/noah-2000s.png",
  // Vaste thuisbatterijen (geverifieerde remotes, Image OS 2026-07)
  "tesla-powerwall-3":
    "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Powerwall.png",
  "byd-battery-box-premium-hvs-10-2":
    "https://sonnekauf.de/wp-content/uploads/2025/07/copy-33.jpg",
  "huawei-luna2000-10-s0":
    "https://solar.huawei.com/admin/asset/v1/pro/view/83edde1a92a94a33ab98eb70fe8eb7aa.png",
  "solaredge-home-battery-10":
    "https://www.mg-solar-shop.com/media/04/78/fd/1774953819/170df4a6a54247a6b6c4b59cf34c717b.png?ts=1774953819",
  "enphase-iq-battery-5p":
    "https://cdn.enfsolar.com/Product/logo/storage_system/6675677c2d149.png",
  "sigenergy-sigenstor-10":
    "https://renewe.fi/wp-content/uploads/2025/11/Sigenergy_SigenStor_invertteri-akusto-lataus-ai_energiajarjestelma.webp",
  "sonnen-eco-8":
    "https://cdn.enfsolar.com/Product/logo/storage_system/6450d50fa1757.png",
  "alphaess-smile-t10":
    "https://cdn.enfsolar.com/Product/logo/storage_system/620bcb64a6801.png",
  "alphaess-smile-b3":
    "https://cdn.enfsolar.com/Product/logo/storage_system/5d3ab2d32f5cd.png",
};

/** Lokale slug-assets (al in /public) als Storage-fallback niet nodig is. */
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
  "tesla-powerwall-3": "/images/products/tesla-powerwall-3.jpg",
  "byd-battery-box-premium-hvs-10-2": "/images/products/byd-battery-box-premium-hvs-10-2.jpg",
  "huawei-luna2000-10-s0": "/images/products/huawei-luna2000-10-s0.jpg",
  "solaredge-home-battery-10": "/images/products/solaredge-home-battery-10.jpg",
  "enphase-iq-battery-5p": "/images/products/enphase-iq-battery-5p.jpg",
  "sigenergy-sigenstor-10": "/images/products/sigenergy-sigenstor-10.jpg",
  "sonnen-eco-8": "/images/products/sonnen-eco-8.jpg",
  "foxess-ecs-10-4": "/images/products/foxess-ecs-10-4.jpg",
  "alphaess-smile-t10": "/images/products/alphaess-smile-t10.jpg",
  "alphaess-smile-b3": "/images/products/alphaess-smile-b3.jpg",
};
