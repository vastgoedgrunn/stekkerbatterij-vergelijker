import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { serverEnv } from "@/lib/env/server";
import { ingestProductImage, resolveAndIngestProductImage } from "./ingest-image.server";

/**
 * Gecureerde bronfoto's (fabrikant/merchant) voor cleanup wanneer offers
 * geen productpagina hebben. Alleen echte productshots, geen logos.
 */
export const CURATED_PRODUCT_IMAGE_SOURCES: Record<string, string> = {
  "anker-solix-solarbank-2-e1600":
    "https://media.s-bol.com/mpv6XZLwRwAR/vgoZlEg/1200x822.jpg",
  "anker-solix-solarbank-2-e1600-pro":
    "https://media.s-bol.com/mpv6XZLwRwAR/vgoZlEg/1200x822.jpg",
  "ecoflow-powerstream-800":
    "https://eu.ecoflow.com/cdn/shop/files/ecoflow-powerstream-microinverter-53568681312599.png?v=1699882644",
  "ecoflow-stream-ac-pro": "https://media.s-bol.com/ZBAAV8y5oG3J/r02o9gk/550x800.jpg",
  "homewizard-plug-in-battery":
    "https://www.homewizard.com/wp-content/uploads/2024/06/HomeWIzard-plugin-battery-featured-image.jpg",
  "homewizard-plug-in-battery-bundle":
    "https://www.homewizard.com/wp-content/uploads/2024/06/HomeWIzard-plugin-battery-featured-image.jpg",
  "marstek-jupiter-c-1024":
    "https://eu.marstekenergy.com/cdn/shop/files/Marstek_Jupiter_All-in-one.jpg?v=1733794244",
  "marstek-venus-512":
    "https://eu.marstekenergy.com/cdn/shop/files/1_8_7c5516ee-a80b-47e1-bab8-35ea0718a0f0.jpg?v=1773985845",
  "sessy-thuisbatterij": "https://www.sessy.nl/wp-content/uploads/2025/08/render-scaled.png",
  "sessy-thuisbatterij-duo": "https://www.sessy.nl/wp-content/uploads/2025/08/render-scaled.png",
  "sunology-play":
    "https://cdn.shopify.com/s/files/1/0469/0165/7754/files/PLAY-480.webp?v=1772742039",
  "sunology-storey":
    "https://cdn.shopify.com/s/files/1/0469/0165/7754/files/sunology-storey-feature-image.webp?v=1742485702",
  "zendure-solarflow-800":
    "https://zendure.com/cdn/shop/files/solarflow-800-with-ac-cable.png?v=1740455072",
  "zendure-solarflow-hyper-2000":
    "https://zendure.com/cdn/shop/files/ZDHYP2000-1AB2000X-png.png?v=1743509454",
};

/** Lokale slug-assets (al in /public) als Storage-fallback niet nodig is. */
export const LOCAL_PRODUCT_IMAGE_PATHS: Record<string, string> = {
  "anker-solix-solarbank-2-e1600": "/images/products/anker-solix-solarbank-2-e1600.jpg",
  "anker-solix-solarbank-2-e1600-pro": "/images/products/anker-solix-solarbank-2-e1600-pro.jpg",
  "ecoflow-powerstream-800": "/images/products/ecoflow-powerstream-800.jpg",
  "ecoflow-stream-ac-pro": "/images/products/ecoflow-stream-ac-pro.jpg",
  "growatt-noah-2000": "/images/products/growatt-noah-2000.jpg",
  "growatt-noah-2000s": "/images/products/growatt-noah-2000s.jpg",
  "homewizard-plug-in-battery": "/images/products/homewizard-plug-in-battery.jpg",
  "homewizard-plug-in-battery-bundle": "/images/products/homewizard-plug-in-battery-bundle.jpg",
  "marstek-jupiter-c-1024": "/images/products/marstek-jupiter-c-1024.jpg",
  "marstek-venus-512": "/images/products/marstek-venus-512.jpg",
  "sessy-thuisbatterij": "/images/products/sessy-thuisbatterij.jpg",
  "sessy-thuisbatterij-duo": "/images/products/sessy-thuisbatterij-duo.jpg",
  "sunology-play": "/images/products/sunology-play.jpg",
  "sunology-storey": "/images/products/sunology-storey.jpg",
  "zendure-solarflow-800": "/images/products/zendure-solarflow-800.jpg",
  "zendure-solarflow-hyper-2000": "/images/products/zendure-solarflow-hyper-2000.jpg",
};

export type ImageRefreshRow = {
  slug: string;
  imagePath: string | null;
  note: string;
  ok: boolean;
};

function getDb() {
  if (!isSupabaseConfigured() || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service role vereist voor image refresh.");
  }
  return createSupabaseServiceClient();
}

/**
 * Zet voor elk product een unieke, correcte foto:
 * 1) curated remote → Storage ingest
 * 2) anders offer-productpagina → og:image → Storage
 * 3) anders lokale slug-asset in /public
 */
export async function refreshAllProductImages(input?: {
  preferLocalAssets?: boolean;
}): Promise<{ updated: number; rows: ImageRefreshRow[] }> {
  const preferLocal = input?.preferLocalAssets ?? false;
  const db = getDb();
  const { data: products, error } = await db
    .from("products")
    .select("id, slug, name, image_path")
    .is("deleted_at", null)
    .returns<{ id: string; slug: string; name: string; image_path: string | null }[]>();

  if (error || !products) {
    throw new Error(error?.message ?? "Kon products niet laden");
  }

  const rows: ImageRefreshRow[] = [];
  let updated = 0;

  for (const product of products) {
    const localPath = LOCAL_PRODUCT_IMAGE_PATHS[product.slug] ?? null;
    const curated = CURATED_PRODUCT_IMAGE_SOURCES[product.slug] ?? null;

    if (preferLocal && localPath) {
      if (product.image_path !== localPath) {
        await db
          .from("products")
          .update({ image_path: localPath, updated_at: new Date().toISOString() } as never)
          .eq("id", product.id);
        updated += 1;
      }
      rows.push({ slug: product.slug, imagePath: localPath, note: "Lokale slug-asset", ok: true });
      continue;
    }

    if (curated) {
      const ingested = await ingestProductImage({ slug: product.slug, sourceUrl: curated });
      if (ingested.ok) {
        await db
          .from("products")
          .update({
            image_path: ingested.storagePath,
            updated_at: new Date().toISOString(),
          } as never)
          .eq("id", product.id);
        updated += 1;
        rows.push({
          slug: product.slug,
          imagePath: ingested.storagePath,
          note: "Curated → Storage",
          ok: true,
        });
        continue;
      }
    }

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

    const resolved = await resolveAndIngestProductImage({
      slug: product.slug,
      productPageUrl: pageUrl,
      candidateImageUrl: curated,
      existingImagePath: localPath ?? product.image_path,
    });

    const nextPath = resolved.imagePath ?? localPath;
    if (nextPath && nextPath !== product.image_path) {
      await db
        .from("products")
        .update({ image_path: nextPath, updated_at: new Date().toISOString() } as never)
        .eq("id", product.id);
      updated += 1;
    }

    rows.push({
      slug: product.slug,
      imagePath: nextPath,
      note: resolved.note,
      ok: Boolean(nextPath),
    });
  }

  return { updated, rows };
}
