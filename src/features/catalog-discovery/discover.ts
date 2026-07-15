import "server-only";
import { MARQUEE_BRAND_SLUGS } from "@/config/marquee-brands";
import { fetchBolCatalogCandidates, getBolClientStatus } from "./bol-client";
import type { DiscoveredCandidate } from "./types";

/**
 * Curated NL research seeds: echte productpagina's / fabrikant-URL's als
 * discovery-start tot Bol-feed live is. Agent mag deze lijst uitbreiden via PR.
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
    url: "https://www.zendure.nl/products/solarflow-800",
    imageUrl: "/images/products/zendure-solarflow.png",
    priceCents: null,
  },
  {
    source: "research",
    externalId: "zendure-bol-hyper-2000",
    brandSlug: "zendure",
    rawTitle: "Zendure SolarFlow Hyper 2000",
    capacityKwh: 1.92,
    powerKw: 2.0,
    url: "https://www.bol.com/nl/nl/p/zendure-solarflow-hyper-2000-hybride-micro-omvormer-thuisbatterij-voor-zonnepanelen-power-station/9300000222945463/",
    imageUrl: "/images/products/zendure-solarflow.png",
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
    imageUrl: "/images/products/ecoflow-powerstream.png",
    priceCents: null,
  },
  {
    source: "research",
    externalId: "anker-bol-solarbank-2-e1600-pro",
    brandSlug: "anker-solix",
    rawTitle: "Anker SOLIX Solarbank 2 E1600 Pro",
    capacityKwh: 1.6,
    powerKw: 0.8,
    url: "https://www.bol.com/nl/nl/p/anker-solix-solarbank-2-e1600-pro/9300000185730379/",
    imageUrl: "/images/products/anker-solix.png",
    priceCents: null,
  },
  {
    source: "research",
    externalId: "marstek-bol-venus-512",
    brandSlug: "marstek",
    rawTitle: "Marstek Venus Plug-In Thuisbatterij 5.12kWh",
    capacityKwh: 5.12,
    powerKw: 0.8,
    url: "https://www.bol.com/nl/nl/p/duravolt-plug-in-thuisbatterij-5-12kw/9300000185746060/",
    imageUrl: "/images/products/marstek-venus.png",
    priceCents: 121000,
  },
  {
    source: "research",
    externalId: "growatt-noah-research",
    brandSlug: "growatt",
    rawTitle: "Growatt NOAH 2000",
    capacityKwh: 2.0,
    powerKw: 0.8,
    url: "https://www.growatt.com/",
    imageUrl: "/images/products/growatt-noah.png",
    priceCents: null,
  },
  {
    source: "research",
    externalId: "sessy-official",
    brandSlug: "sessy",
    rawTitle: "Sessy Thuisbatterij",
    capacityKwh: 5.0,
    powerKw: null,
    url: "https://sessy.nl/",
    imageUrl: "/images/products/sessy.png",
    priceCents: null,
  },
  {
    source: "research",
    externalId: "homewizard-official",
    brandSlug: "homewizard",
    rawTitle: "HomeWizard Plug-In Battery",
    capacityKwh: 2.7,
    powerKw: null,
    url: "https://www.homewizard.com/",
    imageUrl: "/images/products/homewizard-battery.png",
    priceCents: null,
  },
  {
    source: "research",
    externalId: "sunology-storey-research",
    brandSlug: "sunology",
    rawTitle: "Sunology Storey",
    capacityKwh: 2.0,
    powerKw: null,
    url: "https://sunology.eu/",
    imageUrl: "/images/products/sunology-storey.png",
    priceCents: null,
  },
];

export type DiscoverResult = {
  candidates: DiscoveredCandidate[];
  bolStatus: ReturnType<typeof getBolClientStatus>;
};

/**
 * Verzamel discovery-hits: Bol feed (indien geconfigureerd) + research seeds
 * gefilterd op marquee-merken.
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
