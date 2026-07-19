import "server-only";
import { serverEnv } from "@/lib/env/server";
import { buildDaisyconFeedUrl } from "@/lib/affiliate/daisycon";
import { normalizeCandidateImageUrl, isRejectedImageUrl } from "./image-heuristics";

export type FeedImageCandidate = {
  sourceUrl: string;
  source: "daisycon" | "bol" | "curated" | "page" | "local";
  ean?: string;
};

type DaisyconFeedItem = {
  ean?: string | number | null;
  gtin?: string | number | null;
  images?: Array<string | { url?: string; link?: string }>;
  image?: string | null;
  image_url?: string | null;
  title?: string | null;
};

function pickImageFromDaisyconItem(item: DaisyconFeedItem): string | null {
  if (typeof item.image_url === "string") return normalizeCandidateImageUrl(item.image_url);
  if (typeof item.image === "string") return normalizeCandidateImageUrl(item.image);
  if (Array.isArray(item.images)) {
    for (const entry of item.images) {
      if (typeof entry === "string") {
        const url = normalizeCandidateImageUrl(entry);
        if (url) return url;
      } else if (entry && typeof entry === "object") {
        const raw = entry.url ?? entry.link;
        if (typeof raw === "string") {
          const url = normalizeCandidateImageUrl(raw);
          if (url) return url;
        }
      }
    }
  }
  return null;
}

function normalizeEan(value: string | number | null | undefined): string | null {
  if (value == null) return null;
  const digits = String(value).replace(/\D/g, "");
  return digits.length >= 8 ? digits : null;
}

/**
 * Zoek Daisycon JSON-feed image op EAN. Vereist DAISYCON_MEDIA_ID + program_id.
 * Lege/204 feeds → [].
 */
export async function findDaisyconImageByEan(input: {
  ean: string;
  programId: string;
}): Promise<FeedImageCandidate[]> {
  const mediaId = serverEnv.DAISYCON_MEDIA_ID;
  if (!mediaId) return [];
  const ean = normalizeEan(input.ean);
  if (!ean) return [];

  try {
    const feedUrl = buildDaisyconFeedUrl({
      programId: input.programId,
      mediaId,
      type: "json",
    });
    const res = await fetch(feedUrl, {
      headers: { Accept: "application/json", "User-Agent": "StekkerbatterijVergelijkerBot/1.0" },
      signal: AbortSignal.timeout(20000),
    });
    if (res.status === 204 || !res.ok) return [];
    const data: unknown = await res.json();
    const items: DaisyconFeedItem[] = Array.isArray(data)
      ? (data as DaisyconFeedItem[])
      : Array.isArray((data as { data?: unknown })?.data)
        ? ((data as { data: DaisyconFeedItem[] }).data)
        : Array.isArray((data as { products?: unknown })?.products)
          ? ((data as { products: DaisyconFeedItem[] }).products)
          : [];

    const out: FeedImageCandidate[] = [];
    for (const item of items) {
      const itemEan = normalizeEan(item.ean ?? item.gtin);
      if (!itemEan || itemEan !== ean) continue;
      const imageUrl = pickImageFromDaisyconItem(item);
      if (!imageUrl || isRejectedImageUrl(imageUrl)) continue;
      out.push({ sourceUrl: imageUrl, source: "daisycon", ean });
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * Bol productfeed (XML/JSON afhankelijk van config). Best-effort EAN match.
 */
export async function findBolImageByEan(eanRaw: string): Promise<FeedImageCandidate[]> {
  const feedUrl = serverEnv.BOL_PRODUCT_FEED_URL;
  if (!feedUrl) return [];
  const ean = normalizeEan(eanRaw);
  if (!ean) return [];

  try {
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": "StekkerbatterijVergelijkerBot/1.0 (bol-feed)" },
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return [];
    const body = await res.text();
    const out: FeedImageCandidate[] = [];

    if (body.trimStart().startsWith("{") || body.trimStart().startsWith("[")) {
      const data: unknown = JSON.parse(body);
      const items = Array.isArray(data) ? data : [];
      for (const raw of items) {
        if (!raw || typeof raw !== "object") continue;
        const item = raw as Record<string, unknown>;
        const itemEan = normalizeEan(
          (item.ean as string | number | undefined) ??
            (item.EAN as string | number | undefined) ??
            (item.gtin as string | number | undefined),
        );
        if (itemEan !== ean) continue;
        const image =
          (typeof item.imageUrl === "string" && item.imageUrl) ||
          (typeof item.image === "string" && item.image) ||
          (typeof item.image_url === "string" && item.image_url) ||
          null;
        const url = image ? normalizeCandidateImageUrl(image) : null;
        if (url && !isRejectedImageUrl(url)) {
          out.push({ sourceUrl: url, source: "bol", ean });
        }
      }
      return out;
    }

    // Eenvoudige XML: <EAN>…</EAN> in de buurt van <Image> / <image>
    const blocks = body.split(/<\/product>/i);
    for (const block of blocks) {
      if (!block.includes(ean)) continue;
      const eanMatch = block.match(/<EAN[^>]*>\s*(\d+)\s*<\/EAN>/i);
      if (!eanMatch || normalizeEan(eanMatch[1]) !== ean) continue;
      const imgMatch =
        block.match(/<Image[^>]*>\s*(https?:\/\/[^<\s]+)\s*<\/Image>/i) ||
        block.match(/<image[^>]*>\s*(https?:\/\/[^<\s]+)\s*<\/image>/i) ||
        block.match(/url=["'](https?:\/\/[^"']+)["']/i);
      const url = imgMatch?.[1] ? normalizeCandidateImageUrl(imgMatch[1]) : null;
      if (url && !isRejectedImageUrl(url)) {
        out.push({ sourceUrl: url, source: "bol", ean });
      }
    }
    return out;
  } catch {
    return [];
  }
}
