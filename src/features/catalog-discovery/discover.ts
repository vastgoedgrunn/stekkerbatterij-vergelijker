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
    rawTitle: "Zendure SolarFlow 800",
    rawDescription:
      "Hybride micro-omvormer 800W bidirectioneel AC, uitbreidbaar met AB-batterijmodules.",
    capacityKwh: 1.92,
    powerKw: 0.8,
    url: "https://www.zendure.nl/products/solarflow-800?variant=47143119290623",
    imageUrl: "/images/products/zendure-solarflow-800.jpg",
    priceCents: 74700,
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
    priceCents: null,
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
    priceCents: 219900,
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
    url: "https://solarpowersupply.nl/index.php/plug-in-thuisbatterijen/anker-solix-solarbank-2-e1600-ac",
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
    url: "https://nl.growatt.com/products/noah-2000-batterij",
    imageUrl: "/images/products/growatt-noah-2000.jpg",
    priceCents: null,
  },
  {
    source: "research",
    externalId: "growatt-nexa-2000",
    brandSlug: "growatt",
    rawTitle: "Growatt NEXA 2000",
    rawDescription:
      "Alles-in-één plug-in batterij van 2,048 kWh met geïntegreerde omvormer en vier MPPT-ingangen.",
    capacityKwh: 2.048,
    powerKw: 0.8,
    url: "https://www.stralendgroen.nl/product/growatt-nexa-2000/",
    imageUrl: "/images/products/growatt-nexa-2000.png",
    priceCents: 54500,
  },
  {
    source: "research",
    externalId: "sessy-official",
    brandSlug: "sessy",
    rawTitle: "Sessy Thuisbatterij",
    capacityKwh: 5.0,
    powerKw: null,
    url: "https://www.sessy.nl/product/sessy/",
    imageUrl: "/images/products/sessy-thuisbatterij.jpg",
    priceCents: null,
  },
  {
    source: "research",
    externalId: "homewizard-official",
    brandSlug: "homewizard",
    rawTitle: "HomeWizard Plug-In Battery",
    capacityKwh: 2.7,
    powerKw: null,
    url: "https://www.homewizard.com/nl/plug-in-battery/",
    imageUrl: "/images/products/homewizard-plug-in-battery.jpg",
    priceCents: null,
  },
  {
    source: "research",
    externalId: "sunology-storey-research",
    brandSlug: "sunology",
    rawTitle: "Sunology Storey",
    capacityKwh: 2.0,
    powerKw: null,
    url: "https://sunology.eu/products/storey-batterie-stockage-plug-play",
    imageUrl: "/images/products/sunology-storey.jpg",
    priceCents: null,
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
