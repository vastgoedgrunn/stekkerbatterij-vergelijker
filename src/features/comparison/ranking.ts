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
export const RANKING_VERSION = "1.1.0";

/** Externe score of eigen reviews (0 tot 5), anders null. */
export function productQualityScore(product: ProductListItem): number | null {
  if (product.rating.average !== null && product.rating.count > 0) {
    return product.rating.average;
  }
  return product.marketScore?.average ?? null;
}

/** Prijs per kWh opslag in centen; lager is scherper. */
export function productPricePerKwhCents(product: ProductListItem): number | null {
  if (product.lowestPriceCents === null || !product.capacityKwh || product.capacityKwh <= 0) {
    return null;
  }
  return product.lowestPriceCents / product.capacityKwh;
}

/**
 * Beste-koop-metric (lager = beter): €/kWh gedeeld door relatieve kwaliteit.
 * Zo wint niet automatisch de goedkoopste met zwakke merkscore.
 * Scores onder 3,5 krijgen een extra straf van 25%, zodat “beste koop”
 * dichter bij prijs-kwaliteit ligt dan bij kale dump-prijs.
 */
export function bestBuyMetric(product: ProductListItem): number {
  const pricePerKwh = productPricePerKwhCents(product);
  if (pricePerKwh === null) return Number.MAX_SAFE_INTEGER;

  const quality = productQualityScore(product);
  // Ontbrekende score: neutraal 3,5 (niet straffen noch belonen alsof het een topmerk is).
  const qualityFactor = Math.max(0.35, (quality ?? 3.5) / 5);
  let metric = pricePerKwh / qualityFactor;
  if (quality !== null && quality < 3.5) {
    metric *= 1.25;
  }
  return metric;
}

/** Rangschik plug-in producten op beste koop (kwaliteit-gecorrigeerde €/kWh). */
export function rankBestBuys(products: ProductListItem[]): ProductListItem[] {
  return [...products].sort((a, b) => {
    const aPriced = a.lowestPriceCents !== null ? 0 : 1;
    const bPriced = b.lowestPriceCents !== null ? 0 : 1;
    if (aPriced !== bPriced) return aPriced - bPriced;
    const diff = bestBuyMetric(a) - bestBuyMetric(b);
    if (diff !== 0) return diff;
    // Tie-break: hogere kwaliteit, daarna scherpere kale €/kWh.
    const qDiff = (productQualityScore(b) ?? 0) - (productQualityScore(a) ?? 0);
    if (qDiff !== 0) return qDiff;
    return (
      (productPricePerKwhCents(a) ?? Number.MAX_SAFE_INTEGER) -
      (productPricePerKwhCents(b) ?? Number.MAX_SAFE_INTEGER)
    );
  });
}

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

    // Reviews / externe marktscore
    const scoreAverage = productQualityScore(product);
    if (scoreAverage != null) {
      score += scoreAverage * 3;
      if (scoreAverage >= 4) {
        reasons.push(
          product.rating.count > 0
            ? "Goed beoordeeld door gebruikers"
            : "Sterke externe marktscore",
        );
      }
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

    // Reviews / externe marktscore
    const scoreAverage = productQualityScore(product);
    if (scoreAverage != null) {
      score += scoreAverage * 3;
      if (scoreAverage >= 4) {
        reasons.push(
          product.rating.count > 0
            ? "Goed beoordeeld door gebruikers"
            : "Sterke externe marktscore",
        );
      }
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
