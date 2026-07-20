import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { serverEnv } from "@/lib/env/server";
import {
  buildBolPartnerDeeplink,
  fetchBolProductByBolProductId,
  getBolClientStatus,
  type BolCatalogProduct,
} from "./bol-client";
import { extractBolProductId } from "./match-sku";
import { ingestProductImage } from "./ingest-image.server";

/** Full-auto: elke Catalog-prijs wordt toegepast (owner policy 2026-07). */
export const BOL_PRICE_AUTO_MARGIN = 1;

export type BolPriceRefreshItem = {
  offerId: string;
  productSlug: string;
  productName: string;
  url: string;
  oldPriceCents: number;
  newPriceCents: number | null;
  deltaPct: number | null;
  action: "updated" | "out_of_stock" | "unchanged" | "skipped" | "error";
  note: string;
  imageSynced?: boolean;
};

export type BolPriceRefreshResult = {
  bolConfigured: boolean;
  bolDetail: string;
  checked: number;
  updated: number;
  outOfStock: number;
  unchanged: number;
  errors: number;
  imagesSynced: number;
  items: BolPriceRefreshItem[];
};

function getDb() {
  if (!isSupabaseConfigured() || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service role vereist voor Bol prijsrefresh.");
  }
  return createSupabaseServiceClient();
}

function deltaPct(oldCents: number, newCents: number): number {
  if (oldCents <= 0) return 1;
  return Math.abs(newCents - oldCents) / oldCents;
}

/** Sync productfoto + indicatieve prijs vanuit Catalog (Storage upsert). */
async function syncProductFromCatalog(input: {
  db: ReturnType<typeof getDb>;
  productId: string;
  productSlug: string;
  catalog: BolCatalogProduct;
}): Promise<boolean> {
  const { db, productId, productSlug, catalog } = input;
  const nowIso = new Date().toISOString();
  const productPatch: Record<string, unknown> = { updated_at: nowIso };

  if (catalog.priceCents != null && catalog.priceCents > 0) {
    productPatch.indicative_price_min_cents = catalog.priceCents;
  }

  let imageSynced = false;
  if (catalog.imageUrl) {
    const ingested = await ingestProductImage({
      slug: productSlug,
      sourceUrl: catalog.imageUrl,
    });
    if (ingested.ok) {
      productPatch.image_path = ingested.storagePath;
      imageSynced = true;
    }
  }

  if (Object.keys(productPatch).length > 1) {
    await db
      .from("products")
      .update(productPatch as never)
      .eq("id", productId);
  }

  return imageSynced;
}

/**
 * Vernieuw prijzen, voorraad en foto's van bestaande Bol-offers via Marketing Catalog API.
 * Full auto: elke geldige Catalog-prijs wordt toegepast + price_history; foto via include-image.
 */
export async function refreshBolOfferPrices(_input?: {
  /** @deprecated Genegeerd; alle Catalog-prijzen gaan auto door. */
  margin?: number;
}): Promise<BolPriceRefreshResult> {
  const bolStatus = getBolClientStatus();
  const result: BolPriceRefreshResult = {
    bolConfigured: bolStatus.configured,
    bolDetail: bolStatus.detail,
    checked: 0,
    updated: 0,
    outOfStock: 0,
    unchanged: 0,
    errors: 0,
    imagesSynced: 0,
    items: [],
  };

  if (!bolStatus.configured || bolStatus.mode !== "live") {
    return result;
  }
  if (!serverEnv.BOL_CLIENT_ID || !serverEnv.BOL_CLIENT_SECRET) {
    result.bolDetail = "Marketing Catalog credentials ontbreken; prijsrefresh overgeslagen.";
    return result;
  }

  void _input;
  const db = getDb();

  const { data: bolMerchant } = await db
    .from("merchants")
    .select("id")
    .eq("slug", "bol")
    .is("deleted_at", null)
    .maybeSingle<{ id: string }>();

  if (!bolMerchant) {
    result.bolDetail = "Merchant 'bol' niet gevonden.";
    return result;
  }

  const { data: offers, error } = await db
    .from("offers")
    .select(
      "id, price_cents, affiliate_url, affiliate_deeplink, stock_status, products(id, slug, name)",
    )
    .eq("merchant_id", bolMerchant.id)
    .is("deleted_at", null)
    .returns<
      {
        id: string;
        price_cents: number;
        affiliate_url: string | null;
        affiliate_deeplink: string | null;
        stock_status: string;
        products:
          | { id: string; slug: string; name: string }
          | { id: string; slug: string; name: string }[]
          | null;
      }[]
    >();

  if (error) {
    throw new Error(error.message);
  }

  for (const offer of offers ?? []) {
    const product = Array.isArray(offer.products) ? offer.products[0] : offer.products;
    const url = offer.affiliate_url ?? "";
    const bolId = extractBolProductId(url);
    const baseItem = {
      offerId: offer.id,
      productSlug: product?.slug ?? "onbekend",
      productName: product?.name ?? "onbekend",
      url,
      oldPriceCents: offer.price_cents,
    };

    if (!bolId) {
      result.items.push({
        ...baseItem,
        newPriceCents: null,
        deltaPct: null,
        action: "skipped",
        note: "Geen Bol product-ID in affiliate_url",
      });
      continue;
    }

    result.checked += 1;

    try {
      const catalog = await fetchBolProductByBolProductId(bolId);
      const nowIso = new Date().toISOString();
      const deeplink =
        offer.affiliate_deeplink ||
        (catalog?.url ? buildBolPartnerDeeplink(catalog.url) : buildBolPartnerDeeplink(url));

      let imageSynced = false;
      if (catalog && product?.id) {
        imageSynced = await syncProductFromCatalog({
          db,
          productId: product.id,
          productSlug: product.slug,
          catalog,
        });
        if (imageSynced) result.imagesSynced += 1;
      }

      if (!catalog || catalog.priceCents == null || catalog.priceCents <= 0) {
        await db
          .from("offers")
          .update({
            stock_status: "out_of_stock",
            last_checked_at: nowIso,
            affiliate_link_note: `Bol Catalog ${nowIso.slice(0, 10)}: geen best offer / geen prijs`,
            affiliate_deeplink: deeplink,
            updated_at: nowIso,
          } as never)
          .eq("id", offer.id);

        result.outOfStock += 1;
        result.items.push({
          ...baseItem,
          newPriceCents: null,
          deltaPct: null,
          action: "out_of_stock",
          note: "Catalog product zonder best offer",
          imageSynced,
        });
        continue;
      }

      const newPrice = catalog.priceCents;
      const pct = deltaPct(offer.price_cents, newPrice);

      if (offer.price_cents === newPrice && offer.stock_status === "in_stock") {
        await db
          .from("offers")
          .update({
            last_checked_at: nowIso,
            affiliate_deeplink: deeplink,
            affiliate_link_note: `Bol Catalog prijs check ${nowIso.slice(0, 10)} (ongewijzigd)`,
            updated_at: nowIso,
          } as never)
          .eq("id", offer.id);

        result.unchanged += 1;
        result.items.push({
          ...baseItem,
          newPriceCents: newPrice,
          deltaPct: 0,
          action: "unchanged",
          note: imageSynced ? "Prijs gelijk, foto gesynchroniseerd" : "Prijs gelijk",
          imageSynced,
        });
        continue;
      }

      await db
        .from("offers")
        .update({
          price_cents: newPrice,
          stock_status: "in_stock",
          last_checked_at: nowIso,
          affiliate_url: catalog.url || url,
          affiliate_deeplink: deeplink,
          affiliate_link_note: `Bol Catalog prijs ${nowIso.slice(0, 10)} (€${(newPrice / 100).toFixed(2)})`,
          updated_at: nowIso,
        } as never)
        .eq("id", offer.id);

      if (offer.price_cents !== newPrice) {
        await db.from("price_history").insert({
          offer_id: offer.id,
          price_cents: newPrice,
          recorded_at: nowIso,
        } as never);
      }

      result.updated += 1;
      result.items.push({
        ...baseItem,
        newPriceCents: newPrice,
        deltaPct: pct,
        action: "updated",
        note: imageSynced
          ? "Auto-update prijs + foto vanuit Bol Catalog"
          : "Auto-update vanuit Bol Catalog",
        imageSynced,
      });
    } catch (err) {
      result.errors += 1;
      result.items.push({
        ...baseItem,
        newPriceCents: null,
        deltaPct: null,
        action: "error",
        note: err instanceof Error ? err.message : "onbekende fout",
      });
    }
  }

  return result;
}
