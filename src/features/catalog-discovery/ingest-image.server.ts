import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { serverEnv } from "@/lib/env/server";
import { fetchProductPageImageUrl } from "./extract-product-image";

const MAX_BYTES = 5 * 1024 * 1024;
const BUCKET = "products";

export type IngestImageResult =
  { ok: true; storagePath: string; sourceUrl: string } | { ok: false; error: string };

function extensionFor(contentType: string, sourceUrl: string): string {
  const fromType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/gif": "gif",
  };
  if (fromType[contentType]) return fromType[contentType];
  const match = sourceUrl.toLowerCase().match(/\.(jpg|jpeg|png|webp|avif|gif)(?:\?|$)/);
  const ext = match?.[1];
  if (!ext) return "jpg";
  return ext === "jpeg" ? "jpg" : ext;
}

function getDb() {
  if (!isSupabaseConfigured() || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service role vereist voor image ingest.");
  }
  return createSupabaseServiceClient();
}

/**
 * Download een remote productfoto en sla op in Supabase Storage (`products` bucket).
 * Retourneert storage-pad (zonder leading slash) voor `products.image_path`.
 */
export async function ingestProductImage(input: {
  slug: string;
  sourceUrl: string;
}): Promise<IngestImageResult> {
  const { slug, sourceUrl } = input;
  if (!sourceUrl.startsWith("https://") && !sourceUrl.startsWith("http://")) {
    return { ok: false, error: "Alleen http(s) image-URL's kunnen worden geïngest" };
  }

  const httpsUrl = sourceUrl.startsWith("http://")
    ? `https://${sourceUrl.slice("http://".length)}`
    : sourceUrl;

  try {
    const res = await fetch(httpsUrl, {
      redirect: "follow",
      headers: { "User-Agent": "StekkerbatterijVergelijkerBot/1.0 (image-ingest)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      return { ok: false, error: `Image HTTP ${res.status}` };
    }

    const contentType = (res.headers.get("content-type") ?? "").split(";")[0]?.trim() ?? "";
    if (!contentType.startsWith("image/")) {
      return { ok: false, error: `Geen image content-type (${contentType || "leeg"})` };
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength === 0) {
      return { ok: false, error: "Lege image-response" };
    }
    if (buffer.byteLength > MAX_BYTES) {
      return { ok: false, error: `Image te groot (${buffer.byteLength} bytes)` };
    }

    const ext = extensionFor(contentType, httpsUrl);
    const storagePath = `catalog/${slug}.${ext}`;
    const db = getDb();
    const { error } = await db.storage.from(BUCKET).upload(storagePath, buffer, {
      contentType,
      upsert: true,
      cacheControl: "86400",
    });

    if (error) {
      return { ok: false, error: `Storage upload: ${error.message}` };
    }

    return { ok: true, storagePath, sourceUrl: httpsUrl };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Image ingest mislukt",
    };
  }
}

/**
 * Bepaal bronfoto (candidate imageUrl of og:image van productpagina) en ingest naar Storage.
 * Lokale `/images/...` paden blijven staan (al eigen hosting).
 */
export async function resolveAndIngestProductImage(input: {
  slug: string;
  productPageUrl?: string | null;
  candidateImageUrl?: string | null;
  existingImagePath?: string | null;
}): Promise<{ imagePath: string | null; note: string }> {
  const { slug, productPageUrl, candidateImageUrl, existingImagePath } = input;

  if (candidateImageUrl?.startsWith("/images/")) {
    return { imagePath: candidateImageUrl, note: "Lokale asset behouden" };
  }

  let sourceUrl = candidateImageUrl?.startsWith("http") ? candidateImageUrl : null;

  if (!sourceUrl && productPageUrl) {
    sourceUrl = await fetchProductPageImageUrl(productPageUrl);
  }

  if (!sourceUrl) {
    return {
      imagePath: existingImagePath ?? null,
      note: "Geen remote image-bron; bestaande image_path behouden",
    };
  }

  const ingested = await ingestProductImage({ slug, sourceUrl });
  if (!ingested.ok) {
    return {
      imagePath: existingImagePath ?? null,
      note: `Ingest mislukt (${ingested.error}); bestaande image_path behouden`,
    };
  }

  return {
    imagePath: ingested.storagePath,
    note: `Geïngest naar ${ingested.storagePath}`,
  };
}
