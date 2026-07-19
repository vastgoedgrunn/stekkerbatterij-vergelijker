import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { clientEnv } from "@/lib/env/client";
import { serverEnv } from "@/lib/env/server";
import { fetchProductPageImageUrl } from "./extract-product-image";
import {
  probeImageUrl,
  probeLocalPublicImage,
  isRejectedImageUrl,
  normalizeCandidateImageUrl,
} from "./image-heuristics";
import { classifyProductImage, maybeCutoutBackground, sha256Hex } from "./image-vision.server";
import { normalizeToPackshotCanvas } from "./packshot-canvas.server";
import { findBolImageByEan, findDaisyconImageByEan, type FeedImageCandidate } from "./image-feeds.server";
import {
  CURATED_PRODUCT_IMAGE_SOURCES,
  LOCAL_PRODUCT_IMAGE_PATHS,
} from "./product-image-sources";

export type ProductImageStatus = "ok" | "pending" | "rejected" | "broken";

export type ImageOsRepairRow = {
  slug: string;
  status: ProductImageStatus;
  imagePath: string | null;
  note: string;
  ok: boolean;
};

type ProductImageRow = {
  id: string;
  slug: string;
  name: string;
  ean: string | null;
  product_type: "plug_in" | "fixed";
  image_path: string | null;
  image_status: ProductImageStatus | null;
  image_content_hash: string | null;
};

const DAISYCON_PROGRAM_BY_BRAND: Record<string, string> = {
  zendure: "20779",
  homewizard: "18407",
};

function getDb() {
  if (!isSupabaseConfigured() || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service role vereist voor Image OS.");
  }
  return createSupabaseServiceClient();
}

function siteOrigin(): string {
  return clientEnv.NEXT_PUBLIC_SITE_URL ?? "https://stekkerbatterijvergelijker.com";
}

async function collectCandidates(product: ProductImageRow & { brand_slug?: string | null }): Promise<
  FeedImageCandidate[]
> {
  const candidates: FeedImageCandidate[] = [];
  const seen = new Set<string>();

  const push = (c: FeedImageCandidate) => {
    const url = normalizeCandidateImageUrl(c.sourceUrl);
    if (!url || isRejectedImageUrl(url) || seen.has(url)) return;
    seen.add(url);
    candidates.push({ ...c, sourceUrl: url });
  };

  if (product.ean) {
    const brandSlug = product.brand_slug ?? "";
    const programId = DAISYCON_PROGRAM_BY_BRAND[brandSlug];
    if (programId) {
      for (const c of await findDaisyconImageByEan({ ean: product.ean, programId })) push(c);
    }
    for (const c of await findBolImageByEan(product.ean)) push(c);
  }

  const curated = CURATED_PRODUCT_IMAGE_SOURCES[product.slug];
  if (curated) push({ sourceUrl: curated, source: "curated" });

  const db = getDb();
  const { data: offers } = await db
    .from("offers")
    .select("affiliate_url, affiliate_link_status")
    .eq("product_id", product.id)
    .is("deleted_at", null)
    .returns<{ affiliate_url: string | null; affiliate_link_status: string | null }[]>();

  const pageUrl =
    offers?.find((o) => o.affiliate_link_status === "ok" && o.affiliate_url)?.affiliate_url ??
    offers?.find(
      (o) => o.affiliate_url?.includes("/p/") || o.affiliate_url?.includes("/product/"),
    )?.affiliate_url ??
    null;

  if (pageUrl?.startsWith("https://")) {
    const pageImage = await fetchProductPageImageUrl(pageUrl);
    if (pageImage) push({ sourceUrl: pageImage, source: "page" });
  }

  const local = LOCAL_PRODUCT_IMAGE_PATHS[product.slug];
  if (local) {
    const exists = await probeLocalPublicImage(local, siteOrigin());
    if (exists) {
      // Lokale assets gaan niet door remote probe; markeer als speciale kandidaat
      push({ sourceUrl: `${siteOrigin()}${local}`, source: "local" });
    }
  }

  return candidates;
}

async function hashAlreadyUsed(
  hash: string,
  productId: string,
): Promise<{ used: boolean; otherSlug?: string }> {
  const db = getDb();
  const { data } = await db
    .from("products")
    .select("id, slug")
    .eq("image_content_hash", hash)
    .neq("id", productId)
    .is("deleted_at", null)
    .limit(1)
    .returns<{ id: string; slug: string }[]>();
  const other = data?.[0];
  return other ? { used: true, otherSlug: other.slug } : { used: false };
}

async function persistImageState(
  productId: string,
  patch: {
    image_path?: string | null;
    image_status: ProductImageStatus;
    image_source_url?: string | null;
    image_reject_reason?: string | null;
    image_content_hash?: string | null;
  },
): Promise<void> {
  const db = getDb();
  await db
    .from("products")
    .update({
      ...patch,
      image_checked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", productId);
}

/**
 * Image OS repair voor één product: feeds → curated → page → local,
 * heuristics → vision → optional cutout → Storage, duplicate-hash guard.
 */
export async function repairProductImage(productId: string): Promise<ImageOsRepairRow> {
  const db = getDb();
  const { data, error } = await db
    .from("products")
    .select(
      "id, slug, name, ean, product_type, image_path, image_status, image_content_hash, brands(slug)",
    )
    .eq("id", productId)
    .is("deleted_at", null)
    .limit(1)
    .returns<
      {
        id: string;
        slug: string;
        name: string;
        ean: string | null;
        product_type: "plug_in" | "fixed";
        image_path: string | null;
        image_status: ProductImageStatus | null;
        image_content_hash: string | null;
        brands: { slug: string } | null;
      }[]
    >();

  const row = data?.[0];
  if (error || !row) {
    throw new Error(error?.message ?? "Product niet gevonden voor Image OS");
  }

  const product: ProductImageRow & { brand_slug?: string | null } = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    ean: row.ean,
    product_type: row.product_type ?? "plug_in",
    image_path: row.image_path,
    image_status: row.image_status ?? "pending",
    image_content_hash: row.image_content_hash,
    brand_slug: row.brands?.slug ?? null,
  };

  // Bestaande lokale path die echt bestaat → ok zonder her-download
  if (product.image_path?.startsWith("/images/")) {
    const exists = await probeLocalPublicImage(product.image_path, siteOrigin());
    if (exists) {
      await persistImageState(product.id, {
        image_path: product.image_path,
        image_status: "ok",
        image_source_url: `${siteOrigin()}${product.image_path}`,
        image_reject_reason: null,
      });
      return {
        slug: product.slug,
        status: "ok",
        imagePath: product.image_path,
        note: "Lokale asset geverifieerd",
        ok: true,
      };
    }
    await persistImageState(product.id, {
      image_status: "broken",
      image_reject_reason: "Lokale image_path 404",
    });
  }

  const candidates = await collectCandidates(product);
  const failures: string[] = [];

  for (const candidate of candidates) {
    const probe = await probeImageUrl(candidate.sourceUrl);
    if (!probe.ok) {
      failures.push(`${candidate.source}: ${probe.reason}`);
      continue;
    }

    const vision = await classifyProductImage({
      imageUrl: candidate.sourceUrl,
      productName: product.name,
      productType: product.product_type,
    });
    if (vision.decision === "reject") {
      failures.push(`${candidate.source}/vision: ${vision.reason}`);
      continue;
    }

    const cut = await maybeCutoutBackground(probe.buffer);
    let packshot;
    try {
      packshot = await normalizeToPackshotCanvas(cut.buffer);
    } catch (err) {
      failures.push(
        `${candidate.source}/packshot: ${err instanceof Error ? err.message : "canvas mislukt"}`,
      );
      continue;
    }

    const hash = sha256Hex(packshot.buffer);
    const dup = await hashAlreadyUsed(hash, product.id);
    if (dup.used) {
      failures.push(`${candidate.source}: duplicate hash met ${dup.otherSlug}`);
      continue;
    }

    const storagePath = `catalog/${product.slug}.jpg`;
    const upload = await db.storage.from("products").upload(storagePath, packshot.buffer, {
      contentType: packshot.contentType,
      upsert: true,
      cacheControl: "86400",
    });
    if (upload.error) {
      failures.push(`${candidate.source}/upload: ${upload.error.message}`);
      continue;
    }

    await persistImageState(product.id, {
      image_path: storagePath,
      image_status: "ok",
      image_source_url: candidate.sourceUrl,
      image_reject_reason: null,
      image_content_hash: hash,
    });

    return {
      slug: product.slug,
      status: "ok",
      imagePath: storagePath,
      note: `Image OS ok via ${candidate.source}${cut.applied ? " + cutout" : ""} + packshot-canvas`,
      ok: true,
    };
  }

  const reason =
    failures.length > 0
      ? failures.slice(0, 5).join("; ")
      : "Geen image-kandidaten gevonden";

  await persistImageState(product.id, {
    image_status: product.image_path ? "broken" : "pending",
    image_reject_reason: reason,
  });

  return {
    slug: product.slug,
    status: product.image_path ? "broken" : "pending",
    imagePath: product.image_path,
    note: reason,
    ok: false,
  };
}

/**
 * Repair published (en draft) products die niet image_status=ok hebben,
 * of force=true voor volledige her-scan.
 */
export async function repairProductImages(input?: {
  force?: boolean;
  onlySlugs?: string[];
}): Promise<{ repaired: number; failed: number; rows: ImageOsRepairRow[] }> {
  const db = getDb();
  let query = db
    .from("products")
    .select("id, slug, image_status")
    .in("status", ["published", "draft"])
    .is("deleted_at", null);

  if (!input?.force) {
    query = query.neq("image_status", "ok");
  }
  if (input?.onlySlugs?.length) {
    query = query.in("slug", input.onlySlugs);
  }

  const { data, error } = await query.returns<
    { id: string; slug: string; image_status: ProductImageStatus | null }[]
  >();
  if (error) throw new Error(error.message);

  const rows: ImageOsRepairRow[] = [];
  let repaired = 0;
  let failed = 0;

  for (const product of data ?? []) {
    try {
      const row = await repairProductImage(product.id);
      rows.push(row);
      if (row.ok) repaired += 1;
      else failed += 1;
    } catch (err) {
      failed += 1;
      rows.push({
        slug: product.slug,
        status: "broken",
        imagePath: null,
        note: err instanceof Error ? err.message : "Image OS mislukt",
        ok: false,
      });
    }
  }

  return { repaired, failed, rows };
}
