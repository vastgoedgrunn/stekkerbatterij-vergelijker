/**
 * Curated Slimme Energie Shop: alleen geverifieerde Bol-productpagina's.
 * Bron: bol.com product-URL's, gecheckt 2026-07-20.
 * Pakketten = meerdere Bol-items (geen enkele Bol-checkout).
 */

export type ShopSectionId = "meten" | "sturen" | "uitbreiden" | "pakketten";

export type ShopCompatTag =
  | "meten"
  | "aansturing"
  | "homewizard"
  | "anker"
  | "zendure"
  | "marstek";

export interface ShopCatalogItem {
  slug: string;
  section: Exclude<ShopSectionId, "pakketten">;
  name: string;
  brand: string;
  summary: string;
  /** Visuele accentkleur voor de icoon-tegel. */
  accent: "green" | "amber" | "blue" | "slate";
  icon: "gauge" | "plug" | "split" | "cable" | "socket" | "display" | "battery" | "dock";
  labels: string[];
  compat: ShopCompatTag[];
  /** Geverifieerde Bol productpagina (niet zoeken/listing). */
  bolUrl: string;
  /** Indicatieve prijs in centen, bron bol.com 2026-07-20 (wordt in DB als offer-prijs gezet). */
  priceCents: number;
}

export interface ShopBundle {
  slug: string;
  name: string;
  summary: string;
  /** Product-slugs die in dit pakket zitten (1 of meer). */
  itemSlugs: string[];
  /** Optionele multipliciteit per slug (default 1). */
  quantities?: Record<string, number>;
  highlight?: boolean;
}

export const SHOP_SECTIONS: {
  id: ShopSectionId;
  title: string;
  subtitle: string;
}[] = [
  {
    id: "meten",
    title: "Eerst meten",
    subtitle: "P1 meters, displays en kabels om je verbruik in kaart te brengen.",
  },
  {
    id: "sturen",
    title: "Slim sturen",
    subtitle: "Stekkers en splitters om apparaten te meten en te schakelen.",
  },
  {
    id: "uitbreiden",
    title: "Batterij uitbreiden",
    subtitle: "Extra modules en accessoires. Alleen tonen wat bij jouw merk past.",
  },
  {
    id: "pakketten",
    title: "Slimme pakketten",
    subtitle: "Samengestelde sets. Je koopt elk onderdeel apart via bol.",
  },
];

/** Losse shop-SKU's met geverifieerde Bol-ID's. */
export const SHOP_ITEMS: ShopCatalogItem[] = [
  {
    slug: "homewizard-p1-meter",
    section: "meten",
    name: "HomeWizard P1 Meter",
    brand: "HomeWizard",
    summary:
      "Live inzicht in stroom, teruglevering en gas via de P1-poort van je slimme meter. Alleen meten, geen batterij-aansturing.",
    accent: "green",
    icon: "gauge",
    labels: ["Alleen meten", "HomeWizard", "Wi-Fi"],
    compat: ["meten", "homewizard"],
    bolUrl:
      "https://www.bol.com/nl/nl/p/wi-fi-energie-monitor-p1-meter-inzicht-in-je-stroomverbruik-via-app/9300000005832994/",
    priceCents: 3499,
  },
  {
    slug: "homewizard-p1-voeding",
    section: "meten",
    name: "USB-C voeding voor P1 Meter",
    brand: "GO SOLID!",
    summary:
      "Externe voeding voor oudere slimme meters (niet SMR5). Geschikt voor HomeWizard P1 Meter. Geen officieel HomeWizard-merk.",
    accent: "slate",
    icon: "plug",
    labels: ["Voor oudere meters", "Geschikt voor HomeWizard"],
    compat: ["meten", "homewizard"],
    bolUrl:
      "https://www.bol.com/nl/nl/p/go-solid-oplader-geschikt-voor-homewizard-wi-fi-p1-meter/9300000197452613/",
    priceCents: 1995,
  },
  {
    slug: "homewizard-energy-display",
    section: "meten",
    name: "HomeWizard Energy Display",
    brand: "HomeWizard",
    summary:
      "Ziet verbruik, teruglevering en kosten in huis. Werkt met minimaal één HomeWizard Energy-product.",
    accent: "amber",
    icon: "display",
    labels: ["HomeWizard", "Display"],
    compat: ["meten", "homewizard"],
    bolUrl:
      "https://www.bol.com/nl/nl/p/homewizard-energy-display-brengt-jouw-energieverbruik-in-beeld/9300000162175512/",
    priceCents: 6926,
  },
  {
    slug: "p1-kabel-3m",
    section: "meten",
    name: "P1 verlengkabel 3 meter (RJ12)",
    brand: "Goobay",
    summary:
      "Universele RJ12-verlengkabel voor P1-apparatuur. Geschikt om je P1 Meter of splitter verder van de meter te plaatsen.",
    accent: "slate",
    icon: "cable",
    labels: ["RJ12", "3 m", "Universeel"],
    compat: ["meten", "homewizard"],
    bolUrl:
      "https://www.bol.com/nl/nl/p/goobay-telefoon-verlengkabel-rj12-rj12-zwart-3-meter/9200000019143783/",
    priceCents: 629,
  },
  {
    slug: "p1-kabel-5m",
    section: "meten",
    name: "P1 verlengkabel 5 meter (RJ12)",
    brand: "Goobay",
    summary: "Langere RJ12-verlengkabel voor lastige meterkasten of kelderopstellingen.",
    accent: "slate",
    icon: "cable",
    labels: ["RJ12", "5 m", "Universeel"],
    compat: ["meten", "homewizard"],
    bolUrl:
      "https://www.bol.com/nl/nl/p/rj12-rj12-telefoon-verlengkabel-zwart-5-meter/9200000019143663/",
    priceCents: 710,
  },
  {
    slug: "p1-kabel-10m",
    section: "meten",
    name: "P1 verlengkabel 10 meter (RJ12)",
    brand: "Goobay",
    summary:
      "Extra lange RJ12-kabel wanneer 5 meter niet volstaat. Controleer of het P1-signaal stabiel blijft.",
    accent: "slate",
    icon: "cable",
    labels: ["RJ12", "10 m", "Universeel"],
    compat: ["meten", "homewizard"],
    bolUrl:
      "https://www.bol.com/nl/nl/p/rj12-rj12-telefoon-verlengkabel-zwart-10-meter/9200000019144041/",
    priceCents: 1039,
  },
  {
    slug: "homewizard-actieve-p1-splitter",
    section: "sturen",
    name: "HomeWizard Actieve P1 Splitter",
    brand: "HomeWizard",
    summary:
      "Maakt van één P1-poort drie geïsoleerde poorten. Voor P1 Meter naast laadpaal, Toon of warmtepomp.",
    accent: "blue",
    icon: "split",
    labels: ["3 poorten", "Actief", "HomeWizard"],
    compat: ["meten", "aansturing", "homewizard"],
    bolUrl: "https://www.bol.com/nl/nl/p/actieve-p1-splitter/9300000082809573/",
    priceCents: 3700,
  },
  {
    slug: "homewizard-energy-socket",
    section: "sturen",
    name: "HomeWizard Energy Socket",
    brand: "HomeWizard",
    summary:
      "Meet en schakel apparaten tot 3680 W. Ideaal voor boiler, wasmachine of sluipverbruik bij zonnestroom.",
    accent: "green",
    icon: "socket",
    labels: ["Meten + schakelen", "HomeWizard"],
    compat: ["meten", "aansturing", "homewizard"],
    bolUrl: "https://www.bol.com/nl/nl/p/homewizard-wi-fi-energy-socket/9300000123843037/",
    priceCents: 3650,
  },
  {
    slug: "zendure-ab3000x",
    section: "uitbreiden",
    name: "Zendure AB3000X uitbreidingsbatterij",
    brand: "Zendure",
    summary:
      "2,88 kWh extra opslag. Alleen compatibel met SolarFlow 2400 AC (niet met AB2000/Hyper oudere series).",
    accent: "amber",
    icon: "battery",
    labels: ["2,88 kWh", "SolarFlow 2400 AC"],
    compat: ["zendure"],
    bolUrl:
      "https://www.bol.com/nl/nl/p/zendure-solarflow-2400-ac-ab3000x-2880wh-uitbreidingsbatterij/9300000237435925/",
    priceCents: 74999,
  },
  {
    slug: "anker-solix-bp2700",
    section: "uitbreiden",
    name: "Anker SOLIX BP2700 Expansion",
    brand: "Anker SOLIX",
    summary:
      "2,69 kWh uitbreiding. Compatibel met Solarbank 3 E2700 Pro. Niet voor Solarbank 2 (daar is BP1600 nodig).",
    accent: "blue",
    icon: "battery",
    labels: ["2,69 kWh", "Solarbank 3"],
    compat: ["anker"],
    bolUrl:
      "https://www.bol.com/nl/nl/p/anker-solix-bp2700-expansion-battery-2688wh-plug-and-play-compatibel-anker-solix-solarbank-3-e2700-pro/9300000233342583/",
    priceCents: 86600,
  },
  {
    slug: "anker-solix-bp3800",
    section: "uitbreiden",
    name: "Anker SOLIX BP3800 Expansion",
    brand: "Anker SOLIX",
    summary:
      "3,84 kWh uitbreidingsmodule voor ondersteunde Anker SOLIX Solarbank-systemen. Check modelcompatibiliteit op bol.",
    accent: "blue",
    icon: "battery",
    labels: ["3,84 kWh", "Anker SOLIX"],
    compat: ["anker"],
    bolUrl: "https://www.bol.com/nl/nl/p/anker-solix-bp3800-extension-battery-3840wh/9300000171717051/",
    priceCents: 149900,
  },
  {
    slug: "anker-solix-power-dock",
    section: "uitbreiden",
    name: "Anker SOLIX Power Dock",
    brand: "Anker SOLIX",
    summary: "Accessoire voor slim energiebeheer binnen het Anker SOLIX-ecosysteem.",
    accent: "slate",
    icon: "dock",
    labels: ["Anker accessoire"],
    compat: ["anker"],
    bolUrl:
      "https://www.bol.com/nl/nl/p/anker-solix-power-dock-accessoire-slim-energiebeheer-uitbreidbare-functionaliteit-compact-ontwerp/9300000248613510/",
    priceCents: 38400,
  },
];

export const SHOP_BUNDLES: ShopBundle[] = [
  {
    slug: "pakket-p1-start",
    name: "P1 Start",
    summary: "Eerste stap: meten via je slimme meter.",
    itemSlugs: ["homewizard-p1-meter"],
    highlight: true,
  },
  {
    slug: "pakket-p1-compleet",
    name: "P1 Compleet",
    summary: "P1 Meter plus USB-C voeding voor oudere slimme meters.",
    itemSlugs: ["homewizard-p1-meter", "homewizard-p1-voeding"],
  },
  {
    slug: "pakket-p1-inzicht",
    name: "P1 Inzicht",
    summary: "P1 Meter plus Energy Display voor inzicht in huis.",
    itemSlugs: ["homewizard-p1-meter", "homewizard-energy-display"],
  },
  {
    slug: "pakket-slim-meten",
    name: "Slim Meten Pakket",
    summary: "Twee Energy Sockets om apparaten te meten en te schakelen.",
    itemSlugs: ["homewizard-energy-socket"],
    quantities: { "homewizard-energy-socket": 2 },
  },
  {
    slug: "pakket-zonnestroom",
    name: "Zonnestroom Pakket",
    summary: "P1 Meter plus twee sockets: meten én schakelen op zonnestroom.",
    itemSlugs: ["homewizard-p1-meter", "homewizard-energy-socket"],
    quantities: { "homewizard-energy-socket": 2 },
    highlight: true,
  },
  {
    slug: "pakket-volledig-inzicht",
    name: "Volledig Inzicht Pakket",
    summary: "P1 Meter, display en vier Energy Sockets voor maximaal inzicht.",
    itemSlugs: [
      "homewizard-p1-meter",
      "homewizard-energy-display",
      "homewizard-energy-socket",
    ],
    quantities: { "homewizard-energy-socket": 4 },
  },
  {
    slug: "pakket-p1-splitter",
    name: "P1 Splitter Pakket",
    summary: "Actieve splitter plus 3 meter RJ12-kabel.",
    itemSlugs: ["homewizard-actieve-p1-splitter", "p1-kabel-3m"],
  },
];

export function shopItemBySlug(slug: string): ShopCatalogItem | undefined {
  return SHOP_ITEMS.find((item) => item.slug === slug);
}

/** Bouw bol partner-deeplink met site-ID 1532194. */
export function bolPartnerDeeplink(productUrl: string, siteId = "1532194"): string {
  return `https://partner.bol.com/click/click?p=2&t=url&s=${siteId}&url=${encodeURIComponent(productUrl)}`;
}
