import type { ProductListItem } from "@/features/products/types";

export interface WizardPreferences {
  /** Geschat jaarverbruik in kWh. */
  yearlyUsageKwh: number;
  hasSolar: boolean;
  /** PV-capaciteit in kWp (0 = geen / onbekend). */
  solarKwp: number;
  hasHeatPump: boolean;
  hasEv: boolean;
  /** Maximaal budget in centen (0 = geen limiet). */
  budgetCents: number;
  wantExpandable: boolean;
}

export interface RankedProduct {
  product: ProductListItem;
  score: number;
  reasons: string[];
}

/**
 * Transparante, uitlegbare scoring. Geen black box: elke bijdrage is
 * herleidbaar naar een reden. Versiebaar zodat rankings reproduceerbaar zijn.
 */
export const RANKING_VERSION = "1.0.0";

export function rankProducts(
  products: ProductListItem[],
  prefs: WizardPreferences,
): RankedProduct[] {
  const ranked = products.map((product) => {
    let score = 0;
    const reasons: string[] = [];

    // Capaciteit afgestemd op verbruik (vuistregel: ~1 kWh per 400 kWh/jaar).
    const idealCapacity = Math.max(1, prefs.yearlyUsageKwh / 1600);
    if (product.capacityKwh !== null) {
      const diff = Math.abs(product.capacityKwh - idealCapacity);
      const capScore = Math.max(0, 40 - diff * 10);
      score += capScore;
      if (capScore > 25) reasons.push("Capaciteit past goed bij je verbruik");
    }

    // Budget
    if (product.lowestPriceCents !== null) {
      if (prefs.budgetCents === 0 || product.lowestPriceCents <= prefs.budgetCents) {
        score += 20;
        if (prefs.budgetCents > 0) reasons.push("Past binnen je budget");
      } else {
        score -= 15;
      }
    }

    // Zonnepanelen: hoger vermogen is nuttig om piek op te vangen.
    if (prefs.hasSolar && product.powerKw !== null && product.powerKw >= 0.8) {
      score += 10;
      reasons.push("Geschikt om zonne-overschot op te vangen");
    }

    // Uitbreidbaarheid
    if (prefs.wantExpandable && product.expandable) {
      score += 15;
      reasons.push("Uitbreidbaar voor de toekomst");
    }

    // Reviews
    if (product.rating.average !== null) {
      score += product.rating.average * 3;
      if (product.rating.average >= 4) reasons.push("Goed beoordeeld door gebruikers");
    }

    return { product, score: Math.round(score), reasons };
  });

  return ranked.sort((a, b) => b.score - a.score);
}

/**
 * Ranking voor vaste thuisbatterijen (lead/offerte). Geen budgetstraf:
 * prijs volgt via offerte, niet via webshop.
 * Aanroepers filteren zelf op productType === "fixed".
 */
export function rankFixedProducts(
  products: ProductListItem[],
  prefs: WizardPreferences,
): RankedProduct[] {
  const ranked = products.map((product) => {
    let score = 0;
    const reasons: string[] = [];

    // Capaciteit vs. verbruik weegt zwaarder dan bij plug-in (vuistregel: ~1 kWh per 250 kWh/jaar).
    const idealCapacity = Math.max(5, prefs.yearlyUsageKwh / 250);
    if (product.capacityKwh !== null) {
      const diff = Math.abs(product.capacityKwh - idealCapacity);
      const capScore = Math.max(0, 55 - diff * 4);
      score += capScore;
      if (capScore > 30) reasons.push("Capaciteit past goed bij je verbruik");
    }

    // Zonnepanelen: grotere kWp vraagt om meer opslagvermogen.
    if (prefs.hasSolar && prefs.solarKwp > 0) {
      if (product.capacityKwh !== null && product.capacityKwh >= prefs.solarKwp * 1.5) {
        score += 15;
        reasons.push("Capaciteit past bij je zonnepanelen");
      } else if (product.powerKw !== null && product.powerKw >= 3) {
        score += 10;
        reasons.push("Geschikt om zonne-overschot op te vangen");
      }
    }

    // Warmtepomp / EV: vaste systemen zijn hier vaak sterker.
    if (prefs.hasHeatPump) {
      score += 12;
      if (product.capacityKwh !== null && product.capacityKwh >= 10) {
        reasons.push("Ruime capaciteit naast een warmtepomp");
      }
    }
    if (prefs.hasEv) {
      score += 12;
      if (product.capacityKwh !== null && product.capacityKwh >= 10) {
        reasons.push("Geschikt naast thuisladen van een EV");
      }
    }

    // Garantie
    if (product.warrantyYears !== null) {
      score += Math.min(15, product.warrantyYears);
      if (product.warrantyYears >= 10) reasons.push("Lange garantie");
    }

    // Reviews
    if (product.rating.average !== null) {
      score += product.rating.average * 3;
      if (product.rating.average >= 4) reasons.push("Goed beoordeeld door gebruikers");
    }

    // Uitbreidbaarheid (optioneel bonus, geen harde eis)
    if (prefs.wantExpandable && product.expandable) {
      score += 8;
      reasons.push("Uitbreidbaar voor de toekomst");
    }

    return { product, score: Math.round(score), reasons };
  });

  return ranked.sort((a, b) => b.score - a.score);
}
