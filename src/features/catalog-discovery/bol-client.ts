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

const TOKEN_URL = "https://login.bol.com/token?grant_type=client_credentials";
const CATALOG_BASE = "https://api.bol.com/marketing/catalog/v1";

const DEFAULT_SEARCH_TERMS = [
  "stekkerbatterij",
  "plug-in thuisbatterij",
  "thuisbatterij stekker",
  "solarbank",
  "solarflow",
  "homewizard battery",
] as const;

type TokenCache = {
  accessToken: string;
  expiresAtMs: number;
};

let tokenCache: TokenCache | null = null;

export type BolClientStatus = {
  configured: boolean;
  mode: "live" | "stub";
  detail: string;
};

export type BolCatalogProduct = {
  ean: string;
  bolProductId: string;
  url: string;
  title: string;
  description: string | null;
  priceCents: number | null;
  deliveryDescription: string | null;
  gpcChunk: string | null;
};

/** Of Marketing Catalog credentials of een legacy feed gezet zijn. */
export function getBolClientStatus(): BolClientStatus {
  if (serverEnv.BOL_CLIENT_ID && serverEnv.BOL_CLIENT_SECRET) {
    return {
      configured: true,
      mode: "live",
      detail: "Marketing Catalog API (BOL_CLIENT_ID/SECRET) actief.",
    };
  }
  if (serverEnv.BOL_PRODUCT_FEED_URL) {
    return {
      configured: true,
      mode: "live",
      detail: "BOL_PRODUCT_FEED_URL gezet; feed-fetch actief in catalog discovery.",
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
      "Geen Bol keys. Stub retourneert []. Zet BOL_CLIENT_ID + BOL_CLIENT_SECRET in Vercel.",
  };
}

function hasMarketingCatalogCredentials(): boolean {
  return Boolean(serverEnv.BOL_CLIENT_ID && serverEnv.BOL_CLIENT_SECRET);
}

async function getBolAccessToken(): Promise<string> {
  const clientId = serverEnv.BOL_CLIENT_ID;
  const clientSecret = serverEnv.BOL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("BOL_CLIENT_ID/SECRET ontbreken");
  }

  const now = Date.now();
  if (tokenCache && tokenCache.expiresAtMs > now + 30_000) {
    return tokenCache.accessToken;
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      Accept: "application/json",
      "Content-Length": "0",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Bol token HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!json.access_token) {
    throw new Error("Bol token-response zonder access_token");
  }

  const expiresInSec = typeof json.expires_in === "number" ? json.expires_in : 299;
  tokenCache = {
    accessToken: json.access_token,
    expiresAtMs: now + expiresInSec * 1000,
  };
  return json.access_token;
}

async function catalogFetch(pathWithQuery: string): Promise<Response> {
  const token = await getBolAccessToken();
  return fetch(`${CATALOG_BASE}${pathWithQuery}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Accept-Language": "nl",
    },
    signal: AbortSignal.timeout(15_000),
  });
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Parse kWh uit Bol-titels (5,12kWh / 2.688Wh / 2688 Wh). */
export function parseCapacityKwhFromTitle(title: string): number | null {
  const kwh = title.match(/(\d+[.,]?\d*)\s*k\s*wh/i);
  if (kwh?.[1]) {
    const n = Number(kwh[1].replace(",", "."));
    return Number.isFinite(n) && n > 0 && n < 100 ? n : null;
  }
  const wh = title.match(/(\d+[.,]?\d*)\s*wh\b/i);
  if (wh?.[1]) {
    const raw = Number(wh[1].replace(",", "."));
    if (!Number.isFinite(raw) || raw <= 0) return null;
    const kwhVal = raw >= 100 ? raw / 1000 : raw;
    return kwhVal > 0 && kwhVal < 100 ? Math.round(kwhVal * 1000) / 1000 : null;
  }
  return null;
}

function gpcChunkName(gpc: unknown): string | null {
  if (!Array.isArray(gpc)) return null;
  for (const row of gpc) {
    if (!row || typeof row !== "object") continue;
    const r = row as { level?: string; name?: string };
    if (r.level === "CHUNK" && typeof r.name === "string") return r.name;
  }
  return null;
}

function isThuisbatterijHit(title: string, gpcChunk: string | null): boolean {
  if (gpcChunk?.toLowerCase().includes("thuisbatterij")) return true;
  const t = title.toLowerCase();
  return (
    t.includes("thuisbatterij") ||
    t.includes("stekkerbatterij") ||
    t.includes("solarbank") ||
    t.includes("solarflow") ||
    t.includes("plug-in") ||
    t.includes("plug and play") ||
    t.includes("homewizard")
  );
}

function eurosToCents(price: unknown): number | null {
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) return null;
  // Catalog returns euros (e.g. 1099), not cents.
  return Math.round(price * 100);
}

type RawSearchHit = {
  ean?: string;
  bolProductId?: string;
  url?: string;
  title?: string;
  description?: string;
  gpc?: unknown;
};

type RawProduct = RawSearchHit & {
  offer?: { price?: number; deliveryDescription?: string };
};

function normalizeProduct(raw: RawProduct): BolCatalogProduct | null {
  const ean = typeof raw.ean === "string" ? raw.ean.trim() : "";
  const bolProductId =
    typeof raw.bolProductId === "string" ? raw.bolProductId.trim() : "";
  const url = typeof raw.url === "string" ? raw.url.trim() : "";
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!ean || !bolProductId || !url.startsWith("https://") || !title) return null;

  const gpcChunk = gpcChunkName(raw.gpc);
  const description =
    typeof raw.description === "string" ? stripHtml(raw.description).slice(0, 2000) : null;

  return {
    ean,
    bolProductId,
    url,
    title,
    description,
    priceCents: eurosToCents(raw.offer?.price),
    deliveryDescription:
      typeof raw.offer?.deliveryDescription === "string"
        ? raw.offer.deliveryDescription
        : null,
    gpcChunk,
  };
}

/** Zoek producten in de Marketing Catalog (zonder prijs). */
export async function searchBolCatalogProducts(input: {
  searchTerm: string;
  page?: number;
  pageSize?: number;
}): Promise<BolCatalogProduct[]> {
  if (!hasMarketingCatalogCredentials()) return [];

  const page = input.page ?? 1;
  const pageSize = Math.min(input.pageSize ?? 20, 50);
  const q = encodeURIComponent(input.searchTerm);
  const res = await catalogFetch(
    `/products/search?country-code=NL&search-term=${q}&page=${page}&page-size=${pageSize}`,
  );
  if (!res.ok) {
    throw new Error(`Bol search HTTP ${res.status}`);
  }
  const json = (await res.json()) as { results?: RawSearchHit[] };
  const out: BolCatalogProduct[] = [];
  for (const row of json.results ?? []) {
    const product = normalizeProduct(row);
    if (!product) continue;
    if (!isThuisbatterijHit(product.title, product.gpcChunk)) continue;
    out.push(product);
  }
  return out;
}

/** Product + best offer op EAN. */
export async function fetchBolProductByEan(
  ean: string,
): Promise<BolCatalogProduct | null> {
  if (!hasMarketingCatalogCredentials()) return null;
  const clean = ean.trim();
  if (!/^\d{8,14}$/.test(clean)) return null;

  const res = await catalogFetch(
    `/products/${encodeURIComponent(clean)}?country-code=NL&include-offer=true`,
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Bol product-by-ean HTTP ${res.status}`);
  }
  return normalizeProduct((await res.json()) as RawProduct);
}

/** Bol product-ID (URL-pad) → EAN. */
export async function convertBolProductIdToEan(
  bolProductId: string,
): Promise<string | null> {
  if (!hasMarketingCatalogCredentials()) return null;
  const id = bolProductId.trim();
  if (!/^\d{10,}$/.test(id)) return null;

  const res = await catalogFetch(`/products/${encodeURIComponent(id)}/to-ean`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Bol to-ean HTTP ${res.status}`);
  }
  const json = (await res.json()) as { ean?: string };
  return typeof json.ean === "string" ? json.ean : null;
}

/** Product ophalen via bol.com product-ID uit de URL. */
export async function fetchBolProductByBolProductId(
  bolProductId: string,
): Promise<BolCatalogProduct | null> {
  const ean = await convertBolProductIdToEan(bolProductId);
  if (!ean) return null;
  return fetchBolProductByEan(ean);
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next;
      next += 1;
      results[i] = await fn(items[i]!);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () =>
    worker(),
  );
  await Promise.all(workers);
  return results;
}

function toCandidate(product: BolCatalogProduct): DiscoveredCandidate {
  return {
    source: "bol",
    externalId: product.bolProductId,
    brandSlug: guessBrandSlug(product.title),
    rawTitle: product.title,
    rawDescription: product.description,
    capacityKwh: parseCapacityKwhFromTitle(product.title),
    powerKw: null,
    url: product.url,
    imageUrl: null,
    priceCents: product.priceCents,
    payload: {
      ean: product.ean,
      bolProductId: product.bolProductId,
      gpcChunk: product.gpcChunk,
      deliveryDescription: product.deliveryDescription,
    },
  };
}

/**
 * Haal Bol product-hits op voor stekkerbatterij-zoektermen.
 * Primair: Marketing Catalog API. Fallback: productfeed-URL.
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

  if (hasMarketingCatalogCredentials()) {
    try {
      return await fetchViaMarketingCatalog(input?.query, limit);
    } catch {
      // Val terug op feed als die bestaat; anders leeg.
    }
  }

  if (serverEnv.BOL_PRODUCT_FEED_URL) {
    return fetchViaProductFeed(input?.query ?? "stekkerbatterij", limit);
  }

  return [];
}

async function fetchViaMarketingCatalog(
  query: string | undefined,
  limit: number,
): Promise<DiscoveredCandidate[]> {
  const terms = query
    ? [query, ...DEFAULT_SEARCH_TERMS.filter((t) => t !== query)]
    : [...DEFAULT_SEARCH_TERMS];

  const byEan = new Map<string, BolCatalogProduct>();
  for (const term of terms) {
    if (byEan.size >= limit * 2) break;
    const hits = await searchBolCatalogProducts({
      searchTerm: term,
      page: 1,
      pageSize: Math.min(20, limit),
    });
    for (const hit of hits) {
      if (!byEan.has(hit.ean)) byEan.set(hit.ean, hit);
    }
  }

  const unique = [...byEan.values()].slice(0, Math.max(limit, 1));
  const enriched = await mapWithConcurrency(unique, 3, async (hit) => {
    try {
      const full = await fetchBolProductByEan(hit.ean);
      return full ?? hit;
    } catch {
      return hit;
    }
  });

  const out: DiscoveredCandidate[] = [];
  for (const product of enriched) {
    if (!isThuisbatterijHit(product.title, product.gpcChunk)) continue;
    out.push(toCandidate(product));
    if (out.length >= limit) break;
  }
  return out;
}

async function fetchViaProductFeed(
  query: string,
  limit: number,
): Promise<DiscoveredCandidate[]> {
  try {
    const res = await fetch(serverEnv.BOL_PRODUCT_FEED_URL!, {
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
    ["duravolt", "marstek"],
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
