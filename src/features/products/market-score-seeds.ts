/**
 * Geverifieerde externe marktscores (snapshot 2026-07-19).
 * Alleen citeerbare aggregates; geen neppe reviewteksten.
 * Tesla/BYD weggelaten: Trustpilot is daar vooral auto/service, niet batterij-SKU.
 */
export type MarketScoreScope = "sku" | "brand";

export type MarketScoreSeed = {
  slug: string;
  average: number;
  count: number;
  sourceName: string;
  sourceUrl: string;
  scope: MarketScoreScope;
};

export const PRODUCT_MARKET_SCORE_SEEDS: MarketScoreSeed[] = [
  {
    slug: "anker-solix-solarbank-2-e1600",
    average: 4.1,
    count: 215,
    sourceName: "Trustpilot",
    sourceUrl: "https://www.trustpilot.com/review/ankersolix.com",
    scope: "brand",
  },
  {
    slug: "anker-solix-solarbank-2-e1600-pro",
    average: 4.4,
    count: 118,
    sourceName: "Amazon.de",
    sourceUrl: "https://www.amazon.de/dp/B0D1X82HDL",
    scope: "sku",
  },
  {
    slug: "ecoflow-powerstream-800",
    average: 4.5,
    count: 402,
    sourceName: "Amazon.de",
    sourceUrl: "https://www.amazon.de/dp/B0C49HY214",
    scope: "sku",
  },
  {
    slug: "ecoflow-stream-ac-pro",
    average: 4.3,
    count: 172,
    sourceName: "Amazon.de",
    sourceUrl: "https://www.amazon.de/dp/B0F5B1T5LK",
    scope: "sku",
  },
  {
    slug: "growatt-noah-2000",
    average: 4.0,
    count: 260,
    sourceName: "Amazon.de",
    sourceUrl: "https://www.amazon.de/dp/B0DC447JCB",
    scope: "sku",
  },
  {
    slug: "growatt-noah-2000s",
    average: 4.0,
    count: 1262,
    sourceName: "Trustpilot",
    sourceUrl: "https://www.trustpilot.com/review/www.growatt.com",
    scope: "brand",
  },
  {
    slug: "homewizard-plug-in-battery",
    average: 3.7,
    count: 2237,
    sourceName: "Trustpilot",
    sourceUrl: "https://nl.trustpilot.com/review/homewizard.com",
    scope: "brand",
  },
  {
    slug: "homewizard-plug-in-battery-bundle",
    average: 3.7,
    count: 2237,
    sourceName: "Trustpilot",
    sourceUrl: "https://nl.trustpilot.com/review/homewizard.com",
    scope: "brand",
  },
  {
    slug: "marstek-jupiter-c-1024",
    average: 2.8,
    count: 59,
    sourceName: "Trustpilot",
    sourceUrl: "https://www.trustpilot.com/review/marstek.nl",
    scope: "brand",
  },
  {
    slug: "marstek-venus-512",
    average: 2.8,
    count: 59,
    sourceName: "Trustpilot",
    sourceUrl: "https://www.trustpilot.com/review/marstek.nl",
    scope: "brand",
  },
  {
    slug: "sessy-thuisbatterij",
    average: 4.5,
    count: 141,
    sourceName: "Trustindex",
    sourceUrl: "https://www.trustindex.io/reviews/www.sessy.nl",
    scope: "brand",
  },
  {
    slug: "sessy-thuisbatterij-duo",
    average: 4.5,
    count: 141,
    sourceName: "Trustindex",
    sourceUrl: "https://www.trustindex.io/reviews/www.sessy.nl",
    scope: "brand",
  },
  {
    slug: "sunology-play",
    average: 4.7,
    count: 3078,
    sourceName: "Trustpilot",
    sourceUrl: "https://www.trustpilot.com/review/sunology.eu",
    scope: "brand",
  },
  {
    slug: "sunology-storey",
    average: 4.7,
    count: 3078,
    sourceName: "Trustpilot",
    sourceUrl: "https://www.trustpilot.com/review/sunology.eu",
    scope: "brand",
  },
  {
    slug: "zendure-solarflow-800",
    average: 4.7,
    count: 400,
    sourceName: "Trustpilot",
    sourceUrl: "https://www.trustpilot.com/review/zendure.de",
    scope: "brand",
  },
  {
    slug: "zendure-solarflow-hyper-2000",
    average: 4.5,
    count: 293,
    sourceName: "Amazon.de",
    sourceUrl: "https://www.amazon.de/dp/B0DNK3KDRF",
    scope: "sku",
  },
  {
    slug: "huawei-luna2000-10-s0",
    average: 2.3,
    count: 14,
    sourceName: "Trustpilot",
    sourceUrl: "https://www.trustpilot.com/review/solar.huawei.com",
    scope: "brand",
  },
  {
    slug: "solaredge-home-battery-10",
    average: 3.6,
    count: 3859,
    sourceName: "Trustpilot",
    sourceUrl: "https://www.trustpilot.com/review/www.solaredge.com",
    scope: "brand",
  },
  {
    slug: "enphase-iq-battery-5p",
    average: 3.7,
    count: 482,
    sourceName: "Trustpilot",
    sourceUrl: "https://www.trustpilot.com/review/enphase.com",
    scope: "brand",
  },
  {
    slug: "sigenergy-sigenstor-10",
    average: 2.9,
    count: 67,
    sourceName: "Trustpilot",
    sourceUrl: "https://www.trustpilot.com/review/sigenergy.com",
    scope: "brand",
  },
  {
    slug: "sonnen-eco-8",
    average: 3.2,
    count: 3271,
    sourceName: "Trustpilot",
    sourceUrl: "https://de.trustpilot.com/review/sonnen.de",
    scope: "brand",
  },
  {
    slug: "foxess-ecs-10-4",
    average: 1.9,
    count: 42,
    sourceName: "Trustpilot",
    sourceUrl: "https://www.trustpilot.com/review/www.fox-ess.com",
    scope: "brand",
  },
  {
    slug: "alphaess-smile-t10",
    average: 3.9,
    count: 381,
    sourceName: "Trustpilot",
    sourceUrl: "https://nl-be.trustpilot.com/review/alphaess.be",
    scope: "brand",
  },
  {
    slug: "alphaess-smile-b3",
    average: 3.9,
    count: 381,
    sourceName: "Trustpilot",
    sourceUrl: "https://nl-be.trustpilot.com/review/alphaess.be",
    scope: "brand",
  },
];
