import "server-only";
import { MARQUEE_BRAND_SLUGS } from "@/config/marquee-brands";
import { fetchBolCatalogCandidates, getBolClientStatus } from "./bol-client";
import type { DiscoveredCandidate } from "./types";

/**
 * Curated NL research seeds: echte productpagina's / fabrikant-URL's als
 * discovery-start tot Bol-feed live is. Agent mag deze lijst uitbreiden via PR.
 * imageUrl: lokale slug-asset of remote die upsert naar Storage ingest.
 */
const RESEARCH_SEEDS: DiscoveredCandidate[] = [
  {
    source: "research",
    externalId: "zendure-nl-solarflow-800",
    brandSlug: "zendure",
    rawTitle: "Zendure SolarFlow 800 met AB2000L",
    rawDescription:
      "Hybride micro-omvormer met AB2000L batterij, 800 W bidirectioneel AC en 1,92 kWh opslag.",
    capacityKwh: 1.92,
    powerKw: 0.8,
    url: "https://www.zendure.nl/products/solarflow-800?variant=47143119290623",
    imageUrl: "/images/products/zendure-solarflow-800.jpg",
    priceCents: 74700,
    payload: {
      sourceTitle: "SolarFlow 800 + 1*Batterij AB2000L",
      priceCheckedAt: "2026-08-01",
    },
  },
  {
    source: "research",
    externalId: "zendure-bol-hyper-2000",
    brandSlug: "zendure",
    rawTitle: "Zendure SolarFlow Hyper 2000",
    capacityKwh: 1.92,
    powerKw: 2.0,
    url: "https://eu.zendure.com/products/solarflow-hyper-2000",
    imageUrl: "/images/products/zendure-solarflow-hyper-2000.jpg",
    priceCents: null,
  },
  {
    source: "research",
    externalId: "ecoflow-bol-stream-ac-pro",
    brandSlug: "ecoflow",
    rawTitle: "EcoFlow STREAM AC Pro thuisbatterij",
    capacityKwh: 2.0,
    powerKw: 0.8,
    url: "https://www.bol.com/nl/nl/p/ecoflow-stream-ac-pro-thuisbatterij/9300000232241116/",
    imageUrl: "/images/products/ecoflow-stream-ac-pro.jpg",
    priceCents: 74900,
    payload: {
      sourceTitle: "EcoFlow STREAM AC Pro thuisbatterij",
      priceCheckedAt: "2026-07-31",
    },
  },
  {
    source: "research",
    externalId: "ecoflow-powerstream-800",
    brandSlug: "ecoflow",
    rawTitle: "EcoFlow PowerStream 800",
    capacityKwh: 2.0,
    powerKw: 0.8,
    url: "https://eu.ecoflow.com/products/powerstream-microinverter",
    imageUrl: "/images/products/ecoflow-powerstream-800.jpg",
    priceCents: null,
  },
  {
    source: "research",
    externalId: "anker-bol-solarbank-max-ac",
    brandSlug: "anker-solix",
    rawTitle: "Anker SOLIX Solarbank Max AC",
    rawDescription:
      "7 kWh all-in-one plug-in thuisbatterij, 3,5 kW bidirectioneel, uitbreidbaar tot 42 kWh.",
    capacityKwh: 7.0,
    powerKw: 3.5,
    url: "https://www.bol.com/nl/nl/p/anker-solix-solarbank-max-ac-balkonkrachtwerk-met-opslag-7kwh-3600w-alles-in-1-plug-play-thuisaccu-10000-cycli-5-min-installatie-zonnepaneel-met-omvormer/9300000292343906/",
    imageUrl: "/images/products/anker-solix-solarbank-max-ac.jpg",
    priceCents: 209900,
    payload: {
      sourceTitle: "Anker SOLIX Solarbank Max AC",
      priceCheckedAt: "2026-07-31",
    },
  },
  {
    source: "research",
    externalId: "anker-bol-solarbank-2-e1600-pro",
    brandSlug: "anker-solix",
    rawTitle: "Anker SOLIX Solarbank 2 E1600 Pro",
    capacityKwh: 1.6,
    powerKw: 0.8,
    url: "https://www.bol.com/nl/nl/p/anker-solix-solarbank-2-e1600-pro/9300000185730379/",
    imageUrl: "/images/products/anker-solix-solarbank-2-e1600-pro.jpg",
    priceCents: null,
  },
  {
    source: "research",
    externalId: "anker-solarbank-2-e1600",
    brandSlug: "anker-solix",
    rawTitle: "Anker SOLIX Solarbank 2 E1600",
    capacityKwh: 1.6,
    powerKw: 0.8,
    url: "https://www.ankersolix.com/eu/",
    imageUrl: "/images/products/anker-solix-solarbank-2-e1600.jpg",
    priceCents: null,
  },
  {
    source: "research",
    externalId: "marstek-venus-512",
    brandSlug: "marstek",
    rawTitle: "Marstek Venus Plug-In Thuisbatterij 5.12kWh",
    capacityKwh: 5.12,
    powerKw: 0.8,
    url: "https://eu.marstekenergy.com/products/marstek-venus-e-gen-3",
    imageUrl: "/images/products/marstek-venus-512.jpg",
    priceCents: null,
  },
  {
    source: "research",
    externalId: "marstek-jupiter-c",
    brandSlug: "marstek",
    rawTitle: "Marstek Jupiter C 10.24kWh",
    capacityKwh: 10.24,
    powerKw: 3.0,
    url: "https://eu.marstekenergy.com/products/marstek-jupiter-all-in-one-balcony-energy-storage-system",
    imageUrl: "/images/products/marstek-jupiter-c-1024.jpg",
    priceCents: null,
  },
  {
    source: "research",
    externalId: "growatt-noah-research",
    brandSlug: "growatt",
    rawTitle: "Growatt NOAH 2000",
    capacityKwh: 2.0,
    powerKw: 0.8,
    url: "https://www.growatt.nl/",
    imageUrl: "/images/products/growatt-noah-2000.jpg",
    priceCents: null,
  },
  {
    source: "research",
    externalId: "sessy-official",
    brandSlug: "sessy",
    rawTitle: "Sessy Thuisbatterij",
    capacityKwh: 5.0,
    powerKw: null,
    url: "https://www.sessy.nl/bestellen/",
    imageUrl: "/images/products/sessy-thuisbatterij.jpg",
    priceCents: 355000,
    payload: {
      sourceTitle: "Sessy slimme thuisbatterij 5 kWh",
      priceCheckedAt: "2026-08-01",
    },
  },
  {
    source: "research",
    externalId: "homewizard-official",
    brandSlug: "homewizard",
    rawTitle: "HomeWizard Plug-In Battery",
    capacityKwh: 2.7,
    powerKw: 0.8,
    url: "https://www.homewizard.com/nl/shop/plug-in-battery/",
    imageUrl: "/images/products/homewizard-plug-in-battery.jpg",
    priceCents: 119500,
    payload: {
      sourceTitle: "HomeWizard Plug-In Battery",
      priceCheckedAt: "2026-08-01",
    },
  },
  {
    source: "research",
    externalId: "sunology-storey-research",
    brandSlug: "sunology",
    rawTitle: "Sunology STOREY",
    capacityKwh: 2.2,
    powerKw: 0.5,
    url: "https://sunology.eu/products/storey-batterie-stockage-plug-play",
    imageUrl: "/images/products/sunology-storey.jpg",
    priceCents: 139000,
    payload: {
      sourceTitle: "STOREY Master 2200Wh 500W",
      priceCheckedAt: "2026-08-01",
    },
  },
];

export type DiscoverResult = {
  candidates: DiscoveredCandidate[];
  bolStatus: ReturnType<typeof getBolClientStatus>;
};

/**
 * Verzamel discovery-hits: Bol Marketing Catalog (indien geconfigureerd) +
 * research seeds gefilterd op marquee-merken.
 */
export async function discoverCatalogCandidates(): Promise<DiscoverResult> {
  const bolStatus = getBolClientStatus();
  const bolHits = await fetchBolCatalogCandidates({
    query: "stekkerbatterij plug-in thuisbatterij",
    limit: 50,
  });

  const marquee = new Set<string>(MARQUEE_BRAND_SLUGS);
  const seeds = RESEARCH_SEEDS.filter(
    (c) => !c.brandSlug || marquee.has(c.brandSlug as (typeof MARQUEE_BRAND_SLUGS)[number]),
  );

  const byKey = new Map<string, DiscoveredCandidate>();
  for (const c of [...bolHits, ...seeds]) {
    const key = `${c.source}:${c.externalId ?? c.url}`;
    if (!byKey.has(key)) byKey.set(key, c);
  }

  return { candidates: [...byKey.values()], bolStatus };
}
