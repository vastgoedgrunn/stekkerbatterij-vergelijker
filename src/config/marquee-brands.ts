/**
 * Merken die we op de homepage claimen te vergelijken.
 * Catalogus-completeness en Data-agent gebruiken dezelfde lijst.
 */
export const MARQUEE_BRAND_SLUGS = [
  "zendure",
  "ecoflow",
  "anker-solix",
  "marstek",
  "growatt",
  "sessy",
  "homewizard",
  "sunology",
] as const;

export type MarqueeBrandSlug = (typeof MARQUEE_BRAND_SLUGS)[number];

/** Minimum published SKUs per marquee-merk (plan: top-modellen 2–4). */
export const CATALOG_MIN_PRODUCTS_PER_BRAND = 2;

/** Streefmaximum voor de dagelijkse gap-check (niet hard afkappen). */
export const CATALOG_TARGET_PRODUCTS_PER_BRAND = 4;
