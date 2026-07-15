import { HIGH_CONFIDENCE_MATCH_SCORE, type DiscoveredCandidate, type SkuMatchResult } from "./types";

const STOP = new Set([
  "de",
  "het",
  "een",
  "met",
  "voor",
  "van",
  "and",
  "the",
  "thuisbatterij",
  "batterij",
  "stekker",
  "plug",
  "play",
  "power",
  "station",
]);

/** Tokens uit titel voor SKU-vergelijking. */
export function tokenizeTitle(title: string): string[] {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.\s-]/g, " ")
    .split(/[\s/-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOP.has(t));
}

function isBolProductUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.hostname.endsWith("bol.com") && /\/p\/[^/]+\/\d{10,}\/?/i.test(u.pathname)
    );
  } catch {
    return false;
  }
}

function isGenericMerchantHome(url: string): boolean {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/+$/, "");
    if (!path || path === "" || path === "/") return true;
    if (/\/s\/?$/i.test(path)) return true;
    if (u.searchParams.has("searchtext") && !isBolProductUrl(url)) return true;
    return false;
  } catch {
    return true;
  }
}

/**
 * Score een discovery-hit t.o.v. een bestaand product of als standalone SKU.
 * High confidence vereist product-URL + voldoende titel-tokens.
 */
export function scoreSkuMatch(
  candidate: DiscoveredCandidate,
  existingProduct?: {
    name: string;
    capacityKwh: number | null;
    brandSlug: string | null;
  } | null,
): SkuMatchResult {
  const notes: string[] = [];
  let score = 0;

  if (!candidate.url.startsWith("https://")) {
    return { score: 0, notes: ["URL is geen https"], highConfidence: false };
  }

  if (isGenericMerchantHome(candidate.url)) {
    notes.push("URL is homepage/zoekpagina, geen productpagina");
    return { score: 0.1, notes, highConfidence: false };
  }

  if (isBolProductUrl(candidate.url)) {
    score += 0.35;
    notes.push("Bol product-URL met ID");
  } else if (/\/product\/\d+/i.test(candidate.url) || /\/p\//i.test(candidate.url)) {
    score += 0.25;
    notes.push("Merchant product-URL");
  } else {
    score += 0.1;
    notes.push("URL lijkt geen standaard productpad");
  }

  const candTokens = tokenizeTitle(candidate.rawTitle);
  if (candTokens.length >= 2) {
    score += 0.15;
  }

  if (existingProduct) {
    const prodTokens = tokenizeTitle(existingProduct.name);
    const overlap = prodTokens.filter((t) => candTokens.includes(t));
    const ratio =
      prodTokens.length === 0 ? 0 : overlap.length / Math.max(prodTokens.length, 1);
    score += Math.min(0.35, ratio * 0.35);
    notes.push(`Titel-overlap ${(ratio * 100).toFixed(0)}% (${overlap.join(", ") || "geen"})`);

    if (
      existingProduct.brandSlug &&
      candidate.brandSlug &&
      existingProduct.brandSlug === candidate.brandSlug
    ) {
      score += 0.1;
      notes.push("Merk-slug match");
    }

    if (
      existingProduct.capacityKwh != null &&
      candidate.capacityKwh != null &&
      existingProduct.capacityKwh > 0
    ) {
      const delta =
        Math.abs(existingProduct.capacityKwh - candidate.capacityKwh) /
        existingProduct.capacityKwh;
      if (delta <= 0.12) {
        score += 0.15;
        notes.push("Capaciteit binnen 12%");
      } else {
        score -= 0.25;
        notes.push(
          `Capaciteit wijkt af (${existingProduct.capacityKwh} vs ${candidate.capacityKwh} kWh)`,
        );
      }
    }

    // Straf voor duidelijk ander modeltoken in candidate maar niet in product.
    const alien = candTokens.filter(
      (t) =>
        /^(ab|sb|e)\d{3,}/i.test(t) ||
        /\d{3,}/.test(t) && !prodTokens.includes(t) && t.length >= 4,
    );
    if (alien.length > 0 && overlap.length < 2) {
      score -= 0.3;
      notes.push(`Mogelijke andere modelreeks: ${alien.slice(0, 3).join(", ")}`);
    }
  } else {
    // Nieuwe SKU: hogere score als merk + modelachtige tokens + product-URL.
    if (candidate.brandSlug) {
      score += 0.1;
      notes.push("Merk bekend");
    }
    if (candidate.capacityKwh != null || candidate.powerKw != null) {
      score += 0.1;
      notes.push("Specs aanwezig");
    }
    if (candidate.imageUrl) {
      score += 0.05;
      notes.push("Image-URL aanwezig");
    }
  }

  score = Math.max(0, Math.min(1, score));
  const highConfidence =
    score >= HIGH_CONFIDENCE_MATCH_SCORE && !isGenericMerchantHome(candidate.url);

  return { score, notes, highConfidence };
}

/** Extract Bol product id from URL if present. */
export function extractBolProductId(url: string): string | null {
  const m = url.match(/\/p\/[^/]+\/(\d{10,})\/?/i);
  return m?.[1] ?? null;
}
