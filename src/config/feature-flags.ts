/**
 * Feature flags. Sturen de gefaseerde uitrol (MVP = compare-first,
 * commerce = release 2). Later koppelbaar aan omgeving of database.
 */
export const featureFlags = {
  /** Vergelijken + content (MVP). */
  comparison: true,
  decisionWizard: true,
  reviews: true,
  priceAlerts: true,

  /** Commerce (release 2): voorbereid, nog niet actief. */
  checkout: false,
  shipping: false,
} as const;

export type FeatureFlags = typeof featureFlags;

export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return featureFlags[flag];
}
