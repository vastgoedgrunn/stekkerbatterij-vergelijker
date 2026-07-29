import "server-only";

import {
  CATALOG_MIN_PRODUCTS_PER_BRAND,
  CATALOG_TARGET_PRODUCTS_PER_BRAND,
  MARQUEE_BRAND_SLUGS,
} from "@/config/marquee-brands";
import { isEligibleOutboundOffer } from "@/features/offers-pricing/offer-eligibility";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BrandCompleteness = {
  brandSlug: string;
  brandName: string;
  publishedCount: number;
  withImage: number;
  withOffer: number;
  withOutboundOffer: number;
  minRequired: number;
  target: number;
  skuGap: number;
  complete: boolean;
  issues: string[];
};

export type OfferLinkHealthRow = {
  offerId: string;
  productSlug: string;
  merchantName: string;
  status: "ok" | "pending" | "broken";
  note: string | null;
  affiliateDeeplink: string | null;
  affiliateUrl: string | null;
};

export type CatalogCompletenessReport = {
  checkedAt: string;
  brands: BrandCompleteness[];
  unhealthyOffers: OfferLinkHealthRow[];
  summary: {
    brandsBelowMin: number;
    brandsAtTarget: number;
    pendingOrBrokenOffers: number;
  };
};

type BrandProductRow = {
  id: string;
  slug: string;
  image_path: string | null;
  brand: { name: string; slug: string } | null;
};

/**
 * Controleert of elk marquee-merk genoeg published producten heeft
 * (met image + offer) en of affiliate-links gezond zijn.
 */
export async function getCatalogCompletenessReport(): Promise<CatalogCompletenessReport> {
  const supabase = await createSupabaseServerClient();

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, slug, image_path, brand:brands(name, slug)")
    .eq("status", "published")
    .is("deleted_at", null);

  if (productsError) {
    throw new Error(`Catalog completeness: products query faalde (${productsError.message})`);
  }

  const rows = (products ?? []) as unknown as BrandProductRow[];
  const productIds = rows.map((p) => p.id);

  const { data: offers, error: offersError } = productIds.length
    ? await supabase
        .from("offers")
        .select(
          "id, product_id, affiliate_url, affiliate_deeplink, affiliate_link_status, affiliate_link_note, merchant:merchants(name)",
        )
        .in("product_id", productIds)
        .is("deleted_at", null)
    : { data: [], error: null };

  if (offersError) {
    throw new Error(`Catalog completeness: offers query faalde (${offersError.message})`);
  }

  type OfferJoin = {
    id: string;
    product_id: string;
    affiliate_url: string | null;
    affiliate_deeplink: string | null;
    affiliate_link_status: "ok" | "pending" | "broken" | null;
    affiliate_link_note: string | null;
    merchant: { name: string } | null;
  };

  const offerRows = (offers ?? []) as unknown as OfferJoin[];
  const offersByProduct = new Map<string, OfferJoin[]>();
  for (const offer of offerRows) {
    const list = offersByProduct.get(offer.product_id) ?? [];
    list.push(offer);
    offersByProduct.set(offer.product_id, list);
  }

  const slugToProducts = new Map<string, BrandProductRow[]>();
  for (const product of rows) {
    const brandSlug = product.brand?.slug;
    if (!brandSlug) continue;
    const list = slugToProducts.get(brandSlug) ?? [];
    list.push(product);
    slugToProducts.set(brandSlug, list);
  }

  const brands: BrandCompleteness[] = MARQUEE_BRAND_SLUGS.map((brandSlug) => {
    const brandProducts = slugToProducts.get(brandSlug) ?? [];
    const brandName = brandProducts[0]?.brand?.name ?? brandSlug;
    let withImage = 0;
    let withOffer = 0;
    let withOutboundOffer = 0;
    const issues: string[] = [];

    for (const product of brandProducts) {
      if (product.image_path) withImage += 1;
      else issues.push(`${product.slug}: geen image_path`);

      const productOffers = offersByProduct.get(product.id) ?? [];
      if (productOffers.length === 0) {
        issues.push(`${product.slug}: geen offers`);
        continue;
      }
      withOffer += 1;

      const hasOutbound = productOffers.some(isEligibleOutboundOffer);
      if (hasOutbound) withOutboundOffer += 1;
      else issues.push(`${product.slug}: geen bruikbare outbound offer`);
    }

    const publishedCount = brandProducts.length;
    const skuGap = Math.max(0, CATALOG_MIN_PRODUCTS_PER_BRAND - publishedCount);
    if (skuGap > 0) {
      issues.push(`Te weinig SKUs (${publishedCount}/${CATALOG_MIN_PRODUCTS_PER_BRAND})`);
    }
    const complete =
      publishedCount >= CATALOG_MIN_PRODUCTS_PER_BRAND &&
      withImage >= CATALOG_MIN_PRODUCTS_PER_BRAND &&
      withOutboundOffer >= 1;

    return {
      brandSlug,
      brandName,
      publishedCount,
      withImage,
      withOffer,
      withOutboundOffer,
      minRequired: CATALOG_MIN_PRODUCTS_PER_BRAND,
      target: CATALOG_TARGET_PRODUCTS_PER_BRAND,
      skuGap,
      complete,
      issues,
    };
  });

  const productSlugById = new Map(rows.map((p) => [p.id, p.slug]));
  const unhealthyOffers: OfferLinkHealthRow[] = offerRows
    .filter((o) => (o.affiliate_link_status ?? "pending") !== "ok")
    .map((o) => ({
      offerId: o.id,
      productSlug: productSlugById.get(o.product_id) ?? "onbekend",
      merchantName: o.merchant?.name ?? "onbekend",
      status: (o.affiliate_link_status ?? "pending") as "ok" | "pending" | "broken",
      note: o.affiliate_link_note,
      affiliateDeeplink: o.affiliate_deeplink,
      affiliateUrl: o.affiliate_url,
    }));

  return {
    checkedAt: new Date().toISOString(),
    brands,
    unhealthyOffers,
    summary: {
      brandsBelowMin: brands.filter((b) => !b.complete).length,
      brandsAtTarget: brands.filter((b) => b.publishedCount >= CATALOG_TARGET_PRODUCTS_PER_BRAND)
        .length,
      pendingOrBrokenOffers: unhealthyOffers.length,
    },
  };
}
