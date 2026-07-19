import { businessRules } from "@/config/business-rules";

/** Leeftijd van een prijscheck in hele dagen (null = onbekend / behandel als stale). */
export function offerAgeDays(
  checkedAt: string | null | undefined,
  now = Date.now(),
): number | null {
  if (!checkedAt) return null;
  const ms = now - new Date(checkedAt).getTime();
  if (Number.isNaN(ms) || ms < 0) return null;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function isOfferFresh(
  checkedAt: string | null | undefined,
  maxAgeDays: number = businessRules.pricing.offerFreshnessDays,
  now = Date.now(),
): boolean {
  const age = offerAgeDays(checkedAt, now);
  if (age === null) return false;
  return age <= maxAgeDays;
}

/**
 * Relatieve Nederlandse label voor prijscontrole.
 * Voorbeelden: "vandaag", "gisteren", "3 dagen geleden", of absolute datum via fallback.
 */
export function formatPriceCheckedRelative(
  checkedAt: string | null | undefined,
  now = Date.now(),
): string | null {
  if (!checkedAt) return null;
  const age = offerAgeDays(checkedAt, now);
  if (age === null) return null;
  if (age === 0) return "Prijs gecontroleerd vandaag";
  if (age === 1) return "Prijs gecontroleerd gisteren";
  if (age < 7) return `Prijs gecontroleerd ${age} dagen geleden`;
  if (age < 30) {
    const weeks = Math.floor(age / 7);
    return weeks === 1
      ? "Prijs gecontroleerd 1 week geleden"
      : `Prijs gecontroleerd ${weeks} weken geleden`;
  }
  return null;
}
