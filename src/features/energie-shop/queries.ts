import { createSupabasePublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isEligibleOutboundOffer } from "@/features/offers-pricing/offer-eligibility";
import { SHOP_ITEMS } from "./catalog";

export interface ShopOfferRow {
  productId: string;
  productSlug: string;
  offerId: string;
  priceCents: number;
  merchantName: string;
  estimatedCommissionCents: number | null;
}

type OfferJoin = {
  id: string;
  price_cents: number;
  affiliate_url: string | null;
  affiliate_deeplink: string | null;
  affiliate_link_status: string | null;
  deleted_at: string | null;
  commission_type: string | null;
  commission_rate: number | null;
  commission_cents_fixed: number | null;
  merchants: { name: string } | { name: string }[] | null;
};

type ProductJoin = {
  id: string;
  slug: string;
  offers: OfferJoin[] | null;
};

function merchantName(merchants: OfferJoin["merchants"]): string {
  if (!merchants) return "bol";
  if (Array.isArray(merchants)) return merchants[0]?.name ?? "bol";
  return merchants.name;
}

function estimateCommission(offer: OfferJoin): number | null {
  if (offer.commission_cents_fixed != null) return offer.commission_cents_fixed;
  if (offer.commission_rate != null) {
    return Math.round(offer.price_cents * offer.commission_rate);
  }
  // bol Partner: grove schatting 3% tot we tarief syncen
  return Math.round(offer.price_cents * 0.03);
}

/** Laadt Bol-offers voor alle shop-SKU's (keyed op product slug). */
export async function getShopOffersBySlug(): Promise<Map<string, ShopOfferRow>> {
  const map = new Map<string, ShopOfferRow>();
  if (!isSupabaseConfigured()) return map;

  const slugs = SHOP_ITEMS.map((item) => item.slug);
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, offers(id, price_cents, affiliate_url, affiliate_deeplink, affiliate_link_status, deleted_at, commission_type, commission_rate, commission_cents_fixed, merchants(name))",
    )
    .in("slug", slugs)
    .eq("status", "published")
    .eq("product_type", "accessory")
    .is("deleted_at", null)
    .returns<ProductJoin[]>();

  if (error || !data) return map;

  for (const product of data) {
    const eligible = (product.offers ?? []).filter((offer) => {
      if (offer.deleted_at) return false;
      return isEligibleOutboundOffer({
        affiliate_link_status: offer.affiliate_link_status as
          | "ok"
          | "pending"
          | "broken"
          | null,
        affiliate_url: offer.affiliate_url,
        affiliate_deeplink: offer.affiliate_deeplink,
        deleted_at: offer.deleted_at,
      });
    });
    const best = eligible.sort((a, b) => a.price_cents - b.price_cents)[0];
    if (!best) continue;
    map.set(product.slug, {
      productId: product.id,
      productSlug: product.slug,
      offerId: best.id,
      priceCents: best.price_cents,
      merchantName: merchantName(best.merchants),
      estimatedCommissionCents: estimateCommission(best),
    });
  }

  return map;
}
