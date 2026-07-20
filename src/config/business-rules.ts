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
    /**
     * Offers ouder dan dit (dagen sinds last_checked_at) tellen niet mee als
     * "beste prijs" zolang er een verse offer bestaat. Alleen-stale blijft zichtbaar.
     */
    offerFreshnessDays: 7,
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
    /** Default sort voor stekkerbatterijen (plug_in). */
    defaultPlugInSort: "value_asc" as const,
    /** Default sort voor vaste systemen. */
    defaultFixedSort: "capacity_desc" as const,
    /** Featured vaste systemen: verberg merkscores onder deze drempel. */
    minFeaturedMarketScore: 3,
  },

  affiliate: {
    /**
     * Aangenomen click-to-sale voor admin-omzetschatting (CPS).
     * Klik ≠ verkoop: we tellen niet 100% commissie per klik.
     * 3% is een voorzichtige middenmoot voor NL affiliate op thuisbatterijen;
     * echte sales komen uit Bol/Daisycon-dashboards.
     */
    assumedClickToSaleRate: 0.03,
  },
} as const;

export type BusinessRules = typeof businessRules;
