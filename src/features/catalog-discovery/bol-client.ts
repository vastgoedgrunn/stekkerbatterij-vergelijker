import "server-only";
import { serverEnv } from "@/lib/env/server";
import type { DiscoveredCandidate } from "./types";

const BOL_TOKEN_URL = "https://login.bol.com/token?grant_type=client_credentials";
const BOL_CATALOG_BASE = "https://api.bol.com/marketing/catalog/v1";

/** Standaard zoektermen voor NL stekker-/plug-in batterijen. */
const DEFAULT_SEARCH_TERMS = [
  "stekkerbatterij",
  "plug-in thuisbatterij",
  "thuisbatterij stekker",
  "solarbank",
  "solarflow",
  "stream ac pro",
  "marstek venus",
  "growatt noah",
  "homewizard plug-in battery",
] as const;

export type BolClientStatus = {
  configured: boolean;
  mode: "live" | "stub";
  detail: string;
};

type TokenCache = {
  accessToken: string;
  expiresAtMs: number;
};

type BolSearchProduct = {
  ean?: string;
  bolProductId?: string | number;
  title?: string;
  description?: string;
  url?: string;
  offer?: { price?: number; strikethroughPrice?: number; deliveryDescription?: string };
  image?: { url?: string; width?: number; height?: number; mimeType?: string };
  rating?: number | null;
};

type BolTokenResponse = {
  access_token?: string;
  expires_in?: number;
};

let tokenCache: TokenCache | null = null;

function hasMarketingCredentials(): boolean {
  return Boolean(serverEnv.BOL_CLIENT_ID?.trim() && serverEnv.BOL_CLIENT_SECRET?.trim());
}

/** Of Bol Marketing Catalog / feed keys gezet zijn. */
export function getBolClientStatus(): BolClientStatus {
  if (hasMarketingCredentials()) {
    const publisher = serverEnv.BOL_PUBLISHER_ID?.trim();
    return {
      configured: true,
      mode: "live",
      detail: publisher
        ? `Marketing Catalog API actief (OAuth) + deeplinks met s=${publisher}.`
        : "Marketing Catalog API actief (OAuth). Zet BOL_PUBLISHER_ID voor partner-deeplinks.",
    };
  }
  if (serverEnv.BOL_PRODUCT_FEED_URL) {
    return {
      configured: true,
      mode: "live",
      detail:
        "BOL_PRODUCT_FEED_URL gezet; feed-fetch actief wanneer runDiscoveryBol aangeroepen wordt.",
    };
  }
  if (serverEnv.BOL_PARTNER_API_KEY) {
    return {
      configured: true,
      mode: "live",
      detail:
        "Alleen BOL_PARTNER_API_KEY gezet (legacy). Zet BOL_CLIENT_ID + BOL_CLIENT_SECRET voor Catalog API.",
    };
  }
  return {
    configured: false,
    mode: "stub",
    detail:
      "Geen Bol keys. Stub retourneert []. Zet BOL_CLIENT_ID + BOL_CLIENT_SECRET (Marketing Catalog) in Vercel.",
  };
}

/**
 * Haal Bol product-hits op voor stekkerbatterij-zoektermen.
 * Primair: Marketing Catalog API (OAuth client credentials).
 * Fallback: productfeed JSON/CSV.
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
  const query = input?.query?.trim();

  if (hasMarketingCredentials()) {
    try {
      return await fetchViaMarketingCatalog({ query, limit });
    } catch {
      return [];
    }
  }

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
      return normalizeBolCsvFeed(text, limit, query ?? "stekkerbatterij thuisbatterij plug-in");
    } catch {
      return [];
    }
  }

  return [];
}

/** Converteer bol product-ID naar EAN (Catalog API). */
export async function convertBolProductIdToEan(bolProductId: string): Promise<string | null> {
  if (!hasMarketingCredentials() || !/^\d+$/.test(bolProductId)) return null;
  try {
    const res = await bolCatalogGet(`/products/${bolProductId}/to-ean`);
    if (!res.ok) return null;
    const json = (await res.json()) as { ean?: string };
    return typeof json.ean === "string" && /^\d{13}$/.test(json.ean) ? json.ean : null;
  } catch {
    return null;
  }
}

/** Best offer prijs in centen (NL), of null. */
export async function fetchBolBestOfferPriceCents(ean: string): Promise<number | null> {
  if (!hasMarketingCredentials() || !/^\d{13}$/.test(ean)) return null;
  try {
    const res = await bolCatalogGet(
      `/products/${ean}/offers/best?${new URLSearchParams({ "country-code": "NL" })}`,
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { price?: number };
    return priceToCents(json.price);
  } catch {
    return null;
  }
}

/** Bouw Bol partner deeplink wanneer publisher-ID bekend is. */
export function buildBolPartnerDeeplink(productUrl: string): string | null {
  const publisher = serverEnv.BOL_PUBLISHER_ID?.trim();
  if (!publisher || !productUrl.startsWith("https://")) return null;
  const encoded = encodeURIComponent(productUrl);
  return `https://partner.bol.com/click/click?p=2&t=url&s=${publisher}&url=${encoded}`;
}

async function fetchViaMarketingCatalog(input: {
  query?: string;
  limit: number;
}): Promise<DiscoveredCandidate[]> {
  const terms = input.query
    ? [input.query]
    : [...DEFAULT_SEARCH_TERMS];

  const byKey = new Map<string, DiscoveredCandidate>();
  const perTerm = Math.max(8, Math.ceil(input.limit / Math.min(terms.length, 4)));

  for (const term of terms) {
    if (byKey.size >= input.limit) break;
    const products = await searchBolProducts(term, Math.min(50, perTerm));
    for (const product of products) {
      const candidate = mapSearchProductToCandidate(product);
      if (!candidate) continue;
      const key = candidate.externalId ?? candidate.url;
      if (!byKey.has(key)) byKey.set(key, candidate);
      if (byKey.size >= input.limit) break;
    }
  }

  return [...byKey.values()].slice(0, input.limit);
}

async function searchBolProducts(searchTerm: string, pageSize: number): Promise<BolSearchProduct[]> {
  const params = new URLSearchParams({
    "search-term": searchTerm,
    "country-code": "NL",
    "page-size": String(Math.min(50, Math.max(1, pageSize))),
    "include-offer": "true",
    "include-image": "true",
  });
  const res = await bolCatalogGet(`/products/search?${params}`);
  if (!res.ok) {
    throw new Error(`Bol search HTTP ${res.status}`);
  }
  const json = (await res.json()) as { results?: BolSearchProduct[] };
  return Array.isArray(json.results) ? json.results : [];
}

async function getBolAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAtMs) {
    return tokenCache.accessToken;
  }

  const clientId = serverEnv.BOL_CLIENT_ID?.trim();
  const clientSecret = serverEnv.BOL_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("Bol Marketing Catalog credentials ontbreken");
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`, "utf8").toString("base64");
  const res = await fetch(BOL_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      Accept: "application/json",
    },
    body: "",
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`Bol OAuth HTTP ${res.status}`);
  }

  const json = (await res.json()) as BolTokenResponse;
  if (!json.access_token) {
    throw new Error("Bol OAuth: geen access_token");
  }

  const expiresInSec = typeof json.expires_in === "number" ? json.expires_in : 600;
  tokenCache = {
    accessToken: json.access_token,
    expiresAtMs: Date.now() + Math.max(30, expiresInSec - 60) * 1000,
  };
  return json.access_token;
}

async function bolCatalogGet(pathWithQuery: string): Promise<Response> {
  const token = await getBolAccessToken();
  return fetch(`${BOL_CATALOG_BASE}${pathWithQuery}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Accept-Language": "nl",
    },
    signal: AbortSignal.timeout(15_000),
  });
}

function mapSearchProductToCandidate(product: BolSearchProduct): DiscoveredCandidate | null {
  const title = typeof product.title === "string" ? product.title.trim() : "";
  const url = typeof product.url === "string" ? product.url.trim() : "";
  if (!title || !url.startsWith("https://")) return null;

  const ean = typeof product.ean === "string" ? product.ean.trim() : "";
  const bolId =
    product.bolProductId != null ? String(product.bolProductId).trim() : extractBolIdFromUrl(url);
  const externalId = ean || bolId || null;

  return {
    source: "bol",
    externalId,
    brandSlug: guessBrandSlug(title),
    rawTitle: title,
    rawDescription: stripHtml(product.description),
    url,
    imageUrl: typeof product.image?.url === "string" ? product.image.url : null,
    priceCents: priceToCents(product.offer?.price),
    currency: "EUR",
    payload: {
      ean: ean || null,
      bolProductId: bolId,
      deliveryDescription: product.offer?.deliveryDescription ?? null,
      strikethroughPrice: product.offer?.strikethroughPrice ?? null,
    },
  };
}

function priceToCents(price: number | undefined): number | null {
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) return null;
  return Math.round(price * 100);
}

function stripHtml(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0 ? text : null;
}

function extractBolIdFromUrl(url: string): string | null {
  const match = url.match(/\/p\/[^/]+\/(\d{10,})\/?/i);
  return match?.[1] ?? null;
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
