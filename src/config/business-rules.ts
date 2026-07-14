/**
 * Businessregels op één centrale plek. Bewust géén waarden hardcoden
 * verspreid door de codebase. Waarden die operationeel moeten kunnen
 * wijzigen zonder deploy horen later in de `business_settings`-tabel;
 * deze defaults dienen als fallback.
 */
export const businessRules = {
  currency: "EUR",
  locale: "nl-NL",

  /** Btw-tarief als fractie (21% standaard NL). Configureerbaar per release. */
  vatRate: 0.21,

  comparison: {
    /** Maximum aantal producten dat tegelijk vergeleken kan worden. */
    maxItems: 4,
    minItems: 2,
  },

  pricing: {
    /** Omnibus: laagste prijs over dit aantal dagen tonen. */
    lowestPriceWindowDays: 30,
  },

  reviews: {
    minRating: 1,
    maxRating: 5,
    bodyMinLength: 20,
    bodyMaxLength: 4000,
  },

  catalog: {
    defaultPageSize: 24,
    maxPageSize: 96,
  },
} as const;

export type BusinessRules = typeof businessRules;
