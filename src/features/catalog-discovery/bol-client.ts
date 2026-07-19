import "server-only";
import { serverEnv } from "@/lib/env/server";
import {
  buildBolPartnerDeeplink as buildBolPartnerDeeplinkWithId,
  ensureBolPartnerDeeplink as ensureBolPartnerDeeplinkWithId,
} from "@/lib/affiliate/bol";
import type { DiscoveredCandidate } from "./types";

export {
  isBolProductUrl,
  isBolPartnerClickUrl,
  ensureBolPartnerDeeplink,
} from "@/lib/affiliate/bol";

export type BolClientStatus = {
  configured: boolean;
  mode: "live" | "stub";
  detail: string;
};

/** Of Bol feed/API keys gezet zijn. */
export function getBolClientStatus(): BolClientStatus {
  if (serverEnv.BOL_PRODUCT_FEED_URL) {
    return {
      configured: true,
      mode: "live",
      detail:
        "BOL_PRODUCT_FEED_URL gezet; feed-fetch actief in catalog discovery.",
    };
  }
  if (serverEnv.BOL_PARTNER_API_KEY) {
    return {
      configured: true,
      mode: "live",
      detail: "BOL_PARTNER_API_KEY gezet; API-client klaar voor wiring.",
    };
  }
  return {
    configured: false,
    mode: "stub",
    detail:
      "Geen Bol keys. Stub retourneert []. Zet BOL_PRODUCT_FEED_URL of BOL_PARTNER_API_KEY in Vercel.",
  };
}

/**
 * Haal Bol product-hits op voor stekkerbatterij-zoektermen.
 * Zonder keys: lege lijst (research/seed path blijft werken).
 */
export async function fetchBolCatalogCandidates(input?: {
  query?: string;
  limit?: number;
}): Promise<DiscoveredCandidate[]> {
  const status = getBolClientStatus();
  if (!status.configured) {
    return [];
  }

  const limit = input?.limit ?? 40;
  const query = input?.query ?? "stekkerbatterij thuisbatterij plug-in";

  // Feed-URL path (CSV/JSON productfeed wanneer owner die deelt).
  if (serverEnv.BOL_PRODUCT_FEED_URL) {
    try {
      const res = await fetch(serverEnv.BOL_PRODUCT_FEED_URL, {
        headers: {
          "User-Agent": "StekkerbatterijVergelijkerBot/1.0",
          ...(serverEnv.BOL_PARTNER_API_KEY
            ? { Authorization: `Bearer ${serverEnv.BOL_PARTNER_API_KEY}` }
            : {}),
        },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        throw new Error(`Bol feed HTTP ${res.status}`);
      }
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const json = (await res.json()) as unknown;
        return normalizeBolJsonFeed(json, limit);
      }
      const text = await res.text();
      return normalizeBolCsvFeed(text, limit, query);
    } catch {
      return [];
    }
  }

  // API key zonder feed-URL: stub tot endpoint bekend is.
  void query;
  return [];
}

function normalizeBolJsonFeed(json: unknown, limit: number): DiscoveredCandidate[] {
  if (!Array.isArray(json)) return [];
  const out: DiscoveredCandidate[] = [];
  for (const row of json) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const title = String(r.title ?? r.name ?? "").trim();
    const url = String(r.url ?? r.productUrl ?? r.offerUrl ?? "").trim();
    const id = String(r.id ?? r.productId ?? r.ean ?? "").trim() || null;
    if (!title || !url.startsWith("https://")) continue;
    out.push({
      source: "bol",
      externalId: id,
      brandSlug: guessBrandSlug(title),
      rawTitle: title,
      rawDescription: typeof r.description === "string" ? r.description : null,
      capacityKwh: typeof r.capacityKwh === "number" ? r.capacityKwh : null,
      powerKw: typeof r.powerKw === "number" ? r.powerKw : null,
      url,
      imageUrl: typeof r.imageUrl === "string" ? r.imageUrl : null,
      priceCents:
        typeof r.priceCents === "number"
          ? r.priceCents
          : typeof r.price === "number"
            ? Math.round(r.price * 100)
            : null,
      payload: { bol: r },
    });
    if (out.length >= limit) break;
  }
  return out;
}

function normalizeBolCsvFeed(text: string, limit: number, query: string): DiscoveredCandidate[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0]!.split(/[;,]/).map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.findIndex((h) => h.includes(name));
  const titleI = idx("title") >= 0 ? idx("title") : idx("name");
  const urlI = idx("url");
  const idI = idx("id") >= 0 ? idx("id") : idx("ean");
  const priceI = idx("price");
  const imageI = idx("image");
  if (titleI < 0 || urlI < 0) return [];

  const qTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const out: DiscoveredCandidate[] = [];
  for (const line of lines.slice(1)) {
    const cols = line.split(/[;,]/);
    const title = (cols[titleI] ?? "").replace(/^"|"$/g, "").trim();
    const url = (cols[urlI] ?? "").replace(/^"|"$/g, "").trim();
    if (!title || !url.startsWith("https://")) continue;
    const hay = title.toLowerCase();
    if (qTokens.length > 0 && !qTokens.some((t) => hay.includes(t))) continue;
    const priceRaw = priceI >= 0 ? (cols[priceI] ?? "").replace(",", ".") : "";
    const priceNum = Number(priceRaw);
    out.push({
      source: "bol",
      externalId: idI >= 0 ? (cols[idI] ?? "").trim() || null : null,
      brandSlug: guessBrandSlug(title),
      rawTitle: title,
      url,
      imageUrl: imageI >= 0 ? (cols[imageI] ?? "").trim() || null : null,
      priceCents: Number.isFinite(priceNum)
        ? priceNum > 1000
          ? Math.round(priceNum)
          : Math.round(priceNum * 100)
        : null,
      payload: { feed: "csv" },
    });
    if (out.length >= limit) break;
  }
  return out;
}

function guessBrandSlug(title: string): string | null {
  const t = title.toLowerCase();
  const map: [string, string][] = [
    ["zendure", "zendure"],
    ["ecoflow", "ecoflow"],
    ["anker", "anker-solix"],
    ["solix", "anker-solix"],
    ["marstek", "marstek"],
    ["growatt", "growatt"],
    ["sessy", "sessy"],
    ["homewizard", "homewizard"],
    ["sunology", "sunology"],
  ];
  for (const [needle, slug] of map) {
    if (t.includes(needle)) return slug;
  }
  return null;
}

/** Bouw Bol partner deeplink wanneer publisher-ID bekend is. */
export function buildBolPartnerDeeplink(productUrl: string): string | null {
  return buildBolPartnerDeeplinkWithId(productUrl, serverEnv.BOL_PUBLISHER_ID);
}

/** Wrap of normaliseer site-ID op een bol-bestemming (env publisher-ID). */
export function ensureBolOutboundDestination(destination: string): string {
  return ensureBolPartnerDeeplinkWithId(destination, serverEnv.BOL_PUBLISHER_ID);
}
