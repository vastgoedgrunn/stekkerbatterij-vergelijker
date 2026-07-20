import { businessRules } from "@/config/business-rules";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { logger } from "@/lib/observability/logger";
import { estimateCommissionCents } from "@/lib/affiliate/commission";
import {
  isActiveOffer,
  isEligibleOutboundOffer,
  offerOutboundUrl,
} from "@/features/offers-pricing/offer-eligibility";
import { isOfferFresh } from "@/features/offers-pricing/offer-freshness";
import type {
  Brand,
  Category,
  MarketScore,
  ProductDetail,
  ProductFilters,
  ProductListBestOffer,
  ProductListItem,
  ProductListResult,
  ProductOffer,
  ProductRating,
  ProductSort,
  ProductSpec,
} from "./types";

interface RawBrand {
  id: string;
  name: string;
  slug: string;
}

interface RawListOffer {
  id: string;
  price_cents: number;
  affiliate_url: string | null;
  affiliate_deeplink: string | null;
  affiliate_link_status: "ok" | "pending" | "broken" | null;
  deleted_at: string | null;
  commission_type: "cps" | "cpa" | null;
  commission_rate: number | null;
  commission_cents_fixed: number | null;
  is_sponsored: boolean;
  last_checked_at: string | null;
  merchants: { name: string } | null;
}

interface RawOffer {
  id: string;
  merchant_id: string;
  price_cents: number;
  stock_status: ProductOffer["stockStatus"];
  delivery_days: number | null;
  affiliate_url: string | null;
  affiliate_deeplink: string | null;
  affiliate_link_status: "ok" | "pending" | "broken" | null;
  deleted_at: string | null;
  commission_type: "cps" | "cpa" | null;
  commission_rate: number | null;
  commission_cents_fixed: number | null;
  is_sponsored: boolean;
  last_checked_at: string | null;
  merchants: { name: string; slug: string; is_self: boolean } | null;
}

interface RawProduct {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  capacity_kwh: number | null;
  power_kw: number | null;
  cycles: number | null;
  warranty_years: number | null;
  expandable: boolean;
  image_path: string | null;
  product_type: ProductListItem["productType"];
  indicative_price_min_cents: number | null;
  indicative_price_max_cents: number | null;
  market_score_average: number | null;
  market_score_count: number | null;
  market_score_source_name: string | null;
  market_score_source_url: string | null;
  market_score_scope: "sku" | "brand" | null;
  market_score_checked_at: string | null;
  brands: RawBrand | null;
  offers: RawListOffer[] | null;
}

interface RawProductDetail extends Omit<RawProduct, "offers"> {
  supplier_id: string | null;
  sellable: boolean;
  offers: RawOffer[] | null;
}

const emptyResult = (filters: ProductFilters): ProductListResult => ({
  items: [],
  total: 0,
  page: filters.page ?? 1,
  pageSize: filters.pageSize ?? businessRules.catalog.defaultPageSize,
});

function activeOffers<T extends RawListOffer | RawOffer>(offers: T[] | null): T[] {
  return (offers ?? []).filter(isActiveOffer);
}

function outboundOffers<T extends RawListOffer | RawOffer>(offers: T[] | null): T[] {
  return (offers ?? []).filter(isEligibleOutboundOffer);
}

function lowestPrice(offers: { price_cents: number }[] | null): number | null {
  if (!offers || offers.length === 0) return null;
  return offers.reduce(
    (min, o) => (o.price_cents < min ? o.price_cents : min),
    offers[0]!.price_cents,
  );
}

function pickBestOutboundOffer<T extends RawListOffer | RawOffer>(offers: T[] | null): T | null {
  const usable = outboundOffers(offers);
  if (usable.length === 0) return null;
  const fresh = usable.filter((o) => isOfferFresh(o.last_checked_at));
  const pool = fresh.length > 0 ? fresh : usable;
  return [...pool].sort((a, b) => a.price_cents - b.price_cents)[0] ?? null;
}

function mapBestListOffer(offers: RawListOffer[] | null): ProductListBestOffer | null {
  const best = pickBestOutboundOffer(offers);
  if (!best) return null;
  return {
    id: best.id,
    merchantName: best.merchants?.name ?? "Onbekend",
    priceCents: best.price_cents,
    affiliateUrl: offerOutboundUrl(best),
    isSponsored: best.is_sponsored,
    estimatedCommissionCents: estimateCommissionCents({
      commissionType: best.commission_type,
      commissionRate: best.commission_rate,
      commissionCentsFixed: best.commission_cents_fixed,
      priceCents: best.price_cents,
    }),
  };
}

async function fetchRatings(productIds: string[]): Promise<Map<string, ProductRating>> {
  const map = new Map<string, ProductRating>();
  if (productIds.length === 0) return map;

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("product_rating_stats")
    .select("product_id, avg_rating, review_count")
    .in("product_id", productIds)
    .returns<{ product_id: string; avg_rating: number | null; review_count: number }[]>();

  if (error) {
    logger.warn("Kon reviewscores niet laden", { message: error.message });
    return map;
  }

  for (const row of data ?? []) {
    map.set(row.product_id, { average: row.avg_rating, count: row.review_count });
  }
  return map;
}

function mapMarketScore(row: {
  market_score_average: number | null;
  market_score_count: number | null;
  market_score_source_name: string | null;
  market_score_source_url: string | null;
  market_score_scope: "sku" | "brand" | null;
  market_score_checked_at: string | null;
}): MarketScore | null {
  if (
    row.market_score_average == null ||
    row.market_score_count == null ||
    row.market_score_count <= 0 ||
    !row.market_score_source_name ||
    !row.market_score_source_url ||
    !row.market_score_scope
  ) {
    return null;
  }
  return {
    average: Number(row.market_score_average),
    count: row.market_score_count,
    sourceName: row.market_score_source_name,
    sourceUrl: row.market_score_source_url,
    scope: row.market_score_scope,
    checkedAt: row.market_score_checked_at,
  };
}

function displaySortScore(item: ProductListItem): number {
  if (item.rating.average !== null && item.rating.count > 0) return item.rating.average;
  return item.marketScore?.average ?? 0;
}

function pricePerKwh(item: ProductListItem): number {
  if (item.lowestPriceCents === null || !item.capacityKwh || item.capacityKwh <= 0) {
    return Number.MAX_SAFE_INTEGER;
  }
  return item.lowestPriceCents / item.capacityKwh;
}

/** Prijzen eerst; producten zonder live prijs altijd onderaan. */
function withPricedFirst(
  items: ProductListItem[],
  compare: (a: ProductListItem, b: ProductListItem) => number,
): ProductListItem[] {
  return [...items].sort((a, b) => {
    const aPriced = a.lowestPriceCents !== null ? 0 : 1;
    const bPriced = b.lowestPriceCents !== null ? 0 : 1;
    if (aPriced !== bPriced) return aPriced - bPriced;
    return compare(a, b);
  });
}

function sortItems(items: ProductListItem[], sort: ProductSort): ProductListItem[] {
  const byPrice = (a: ProductListItem, b: ProductListItem) =>
    (a.lowestPriceCents ?? Number.MAX_SAFE_INTEGER) -
    (b.lowestPriceCents ?? Number.MAX_SAFE_INTEGER);

  switch (sort) {
    case "price_asc":
      return withPricedFirst(items, byPrice);
    case "price_desc":
      return withPricedFirst(items, (a, b) => byPrice(b, a));
    case "value_asc":
      return withPricedFirst(items, (a, b) => pricePerKwh(a) - pricePerKwh(b));
    case "capacity_desc":
      return withPricedFirst(items, (a, b) => (b.capacityKwh ?? 0) - (a.capacityKwh ?? 0));
    case "rating_desc":
      return withPricedFirst(items, (a, b) => displaySortScore(b) - displaySortScore(a));
    case "relevance":
    default:
      // Meer aanbieders en scherpere €/kWh eerst; zonder prijs onderaan.
      return withPricedFirst(items, (a, b) => {
        if (b.offerCount !== a.offerCount) return b.offerCount - a.offerCount;
        return pricePerKwh(a) - pricePerKwh(b);
      });
  }
}

export async function getBrands(): Promise<Brand[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug")
    .order("name")
    .returns<RawBrand[]>();
  if (error) {
    logger.warn("Kon merken niet laden", { message: error.message });
    return [];
  }
  return (data ?? []).map((b) => ({ id: b.id, name: b.name, slug: b.slug }));
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .order("sort_order")
    .returns<{ id: string; name: string; slug: string; description: string | null }[]>();
  if (error) {
    logger.warn("Kon categorieën niet laden", { message: error.message });
    return [];
  }
  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
  }));
}

async function resolveCategoryProductIds(categorySlug: string): Promise<string[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("product_categories")
    .select("product_id, categories!inner(slug)")
    .eq("categories.slug", categorySlug)
    .returns<{ product_id: string }[]>();
  if (error) {
    logger.warn("Kon categoriefilter niet toepassen", { message: error.message });
    return [];
  }
  return (data ?? []).map((r) => r.product_id);
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductListResult> {
  if (!isSupabaseConfigured()) return emptyResult(filters);

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(
    filters.pageSize ?? businessRules.catalog.defaultPageSize,
    businessRules.catalog.maxPageSize,
  );

  const supabase = createSupabasePublicClient();

  let query = supabase
    .from("products")
    .select(
      "id, slug, name, summary, capacity_kwh, power_kw, cycles, warranty_years, expandable, image_path, product_type, indicative_price_min_cents, indicative_price_max_cents, market_score_average, market_score_count, market_score_source_name, market_score_source_url, market_score_scope, market_score_checked_at, brands(id, name, slug), offers(id, price_cents, affiliate_url, affiliate_deeplink, affiliate_link_status, deleted_at, commission_type, commission_rate, commission_cents_fixed, is_sponsored, last_checked_at, merchants(name))",
    )
    .eq("status", "published")
    .is("deleted_at", null);

  if (filters.productType) {
    query = query.eq("product_type", filters.productType);
  }

  if (filters.search) {
    const term = filters.search.replace(/[%_,]/g, "").trim();
    if (term) {
      const { data: matchingBrands } = await supabase
        .from("brands")
        .select("id")
        .ilike("name", `%${term}%`)
        .returns<{ id: string }[]>();
      const brandIds = (matchingBrands ?? []).map((b) => b.id);
      // PostgREST: quotes rond ilike-waarden met %
      const nameClause = `name.ilike."%${term}%"`;
      const summaryClause = `summary.ilike."%${term}%"`;
      if (brandIds.length > 0) {
        query = query.or(`${nameClause},${summaryClause},brand_id.in.(${brandIds.join(",")})`);
      } else {
        query = query.or(`${nameClause},${summaryClause}`);
      }
    }
  }
  if (filters.brandSlug) {
    const { data: brands } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", filters.brandSlug)
      .limit(1)
      .returns<{ id: string }[]>();
    const brand = brands?.[0];
    if (brand) {
      query = query.eq("brand_id", brand.id);
    } else {
      return emptyResult(filters);
    }
  }
  if (filters.categorySlug) {
    const ids = await resolveCategoryProductIds(filters.categorySlug);
    if (ids.length === 0) return emptyResult(filters);
    query = query.in("id", ids);
  }
  if (typeof filters.minCapacity === "number") {
    query = query.gte("capacity_kwh", filters.minCapacity);
  }
  if (typeof filters.maxCapacity === "number") {
    query = query.lte("capacity_kwh", filters.maxCapacity);
  }
  if (filters.expandableOnly) {
    query = query.eq("expandable", true);
  }

  const { data, error } = await query.returns<RawProduct[]>();
  if (error) {
    logger.warn("Kon producten niet laden", { message: error.message });
    return emptyResult(filters);
  }

  const rows = data ?? [];
  const ratings = await fetchRatings(rows.map((r) => r.id));

  const mapped: ProductListItem[] = rows
    .filter((r): r is RawProduct & { brands: RawBrand } => r.brands !== null)
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      brand: { id: r.brands.id, name: r.brands.name, slug: r.brands.slug },
      summary: r.summary,
      capacityKwh: r.capacity_kwh,
      powerKw: r.power_kw,
      cycles: r.cycles,
      warrantyYears: r.warranty_years,
      expandable: r.expandable,
      imagePath: r.image_path,
      productType: r.product_type ?? "plug_in",
      indicativePriceMinCents: r.indicative_price_min_cents,
      indicativePriceMaxCents: r.indicative_price_max_cents,
      lowestPriceCents: lowestPrice(activeOffers(r.offers)),
      offerCount: activeOffers(r.offers).length,
      bestOffer: mapBestListOffer(r.offers),
      rating: ratings.get(r.id) ?? { average: null, count: 0 },
      marketScore: mapMarketScore(r),
    }));

  const priceFiltered = mapped.filter((item) => {
    if (typeof filters.minPrice === "number") {
      if (item.lowestPriceCents === null || item.lowestPriceCents < filters.minPrice * 100) {
        return false;
      }
    }
    if (typeof filters.maxPrice === "number") {
      if (item.lowestPriceCents === null || item.lowestPriceCents > filters.maxPrice * 100) {
        return false;
      }
    }
    return true;
  });

  const resolvedSort: ProductSort =
    filters.sort ??
    (filters.productType === "fixed"
      ? businessRules.catalog.defaultFixedSort
      : filters.productType === "plug_in"
        ? businessRules.catalog.defaultPlugInSort
        : "relevance");

  const sorted = sortItems(priceFiltered, resolvedSort);
  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);

  return { items, total, page, pageSize };
}

export async function getProductSlugs(
  productType?: ProductListItem["productType"],
): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createSupabasePublicClient();
  let query = supabase
    .from("products")
    .select("slug")
    .eq("status", "published")
    .is("deleted_at", null);
  if (productType) {
    query = query.eq("product_type", productType);
  }
  const { data, error } = await query.returns<{ slug: string }[]>();
  if (error) return [];
  return (data ?? []).map((r) => r.slug);
}

export async function getProductTypeBySlug(
  slug: string,
): Promise<ProductListItem["productType"] | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("product_type")
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .limit(1)
    .returns<{ product_type: ProductListItem["productType"] }[]>();
  if (error) return null;
  return data?.[0]?.product_type ?? null;
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, summary, description, capacity_kwh, power_kw, cycles, warranty_years, expandable, image_path, product_type, indicative_price_min_cents, indicative_price_max_cents, market_score_average, market_score_count, market_score_source_name, market_score_source_url, market_score_scope, market_score_checked_at, supplier_id, sellable, brands(id, name, slug), offers(id, merchant_id, price_cents, stock_status, delivery_days, affiliate_url, affiliate_deeplink, affiliate_link_status, deleted_at, commission_type, commission_rate, commission_cents_fixed, is_sponsored, last_checked_at, merchants(name, slug, is_self))",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .limit(1)
    .returns<RawProductDetail[]>();

  if (error) {
    logger.warn("Kon product niet laden", { message: error.message, slug });
    return null;
  }
  const product = data?.[0];
  if (!product || !product.brands) return null;

  const [ratings, specs, categories, priceHistory] = await Promise.all([
    fetchRatings([product.id]),
    getProductSpecs(product.id),
    getProductCategories(product.id),
    getPriceHistory(product.id),
  ]);

  const offers: ProductOffer[] = activeOffers(product.offers)
    .map((o) => ({
      id: o.id,
      merchantName: o.merchants?.name ?? "Onbekend",
      merchantSlug: o.merchants?.slug ?? "",
      isSelf: o.merchants?.is_self ?? false,
      isSponsored: o.is_sponsored,
      priceCents: o.price_cents,
      stockStatus: o.stock_status,
      deliveryDays: o.delivery_days,
      affiliateUrl: offerOutboundUrl(o),
      lastCheckedAt: o.last_checked_at,
      estimatedCommissionCents: estimateCommissionCents({
        commissionType: o.commission_type,
        commissionRate: o.commission_rate,
        commissionCentsFixed: o.commission_cents_fixed,
        priceCents: o.price_cents,
      }),
    }))
    .sort((a, b) => a.priceCents - b.priceCents);

  const bestRaw = pickBestOutboundOffer(product.offers);
  const bestOutbound = bestRaw
    ? (offers.find((o) => o.id === bestRaw.id) ?? offers.find((o) => o.affiliateUrl))
    : offers.find((o) => o.affiliateUrl);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: { id: product.brands.id, name: product.brands.name, slug: product.brands.slug },
    summary: product.summary,
    description: product.description,
    capacityKwh: product.capacity_kwh,
    powerKw: product.power_kw,
    cycles: product.cycles,
    warrantyYears: product.warranty_years,
    expandable: product.expandable,
    imagePath: product.image_path,
    productType: product.product_type ?? "plug_in",
    indicativePriceMinCents: product.indicative_price_min_cents,
    indicativePriceMaxCents: product.indicative_price_max_cents,
    supplierId: product.supplier_id,
    sellable: product.sellable ?? false,
    lowestPriceCents: offers.length > 0 ? offers[0]!.priceCents : null,
    offerCount: offers.length,
    bestOffer: bestOutbound
      ? {
          id: bestOutbound.id,
          merchantName: bestOutbound.merchantName,
          priceCents: bestOutbound.priceCents,
          affiliateUrl: bestOutbound.affiliateUrl,
          isSponsored: bestOutbound.isSponsored,
          estimatedCommissionCents: bestOutbound.estimatedCommissionCents,
        }
      : null,
    rating: ratings.get(product.id) ?? { average: null, count: 0 },
    marketScore: mapMarketScore(product),
    categories,
    specs,
    offers,
    priceHistory,
  };
}

async function getProductSpecs(productId: string): Promise<ProductSpec[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("product_specs")
    .select(
      "value_number, value_text, value_boolean, spec_definitions(key, label, unit, data_type, sort_order)",
    )
    .eq("product_id", productId)
    .returns<
      {
        value_number: number | null;
        value_text: string | null;
        value_boolean: boolean | null;
        spec_definitions: {
          key: string;
          label: string;
          unit: string | null;
          data_type: "number" | "text" | "boolean";
          sort_order: number;
        } | null;
      }[]
    >();

  if (error || !data) return [];

  return data
    .filter((r) => r.spec_definitions !== null)
    .map((r) => {
      const def = r.spec_definitions!;
      let value = "";
      if (def.data_type === "number" && r.value_number !== null) {
        value = `${r.value_number}${def.unit ? ` ${def.unit}` : ""}`;
      } else if (def.data_type === "boolean" && r.value_boolean !== null) {
        value = r.value_boolean ? "Ja" : "Nee";
      } else if (r.value_text) {
        value = r.value_text;
      }
      return { key: def.key, label: def.label, unit: def.unit, value, sortOrder: def.sort_order };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ key, label, unit, value }) => ({ key, label, unit, value }));
}

async function getProductCategories(productId: string): Promise<Category[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("product_categories")
    .select("categories(id, name, slug, description)")
    .eq("product_id", productId)
    .returns<{ categories: Category | null }[]>();
  if (error || !data) return [];
  return data.map((r) => r.categories).filter((c): c is Category => c !== null);
}

async function getPriceHistory(productId: string): Promise<ProductDetail["priceHistory"]> {
  const supabase = createSupabasePublicClient();
  const { data: selfOffers } = await supabase
    .from("offers")
    .select("id, merchants!inner(is_self)")
    .eq("product_id", productId)
    .eq("merchants.is_self", true)
    .limit(1)
    .returns<{ id: string }[]>();

  const selfOffer = selfOffers?.[0];
  if (!selfOffer) return [];

  const { data, error } = await supabase
    .from("price_history")
    .select("price_cents, recorded_at")
    .eq("offer_id", selfOffer.id)
    .order("recorded_at", { ascending: true })
    .returns<{ price_cents: number; recorded_at: string }[]>();

  if (error || !data) return [];
  return data.map((p) => ({ priceCents: p.price_cents, recordedAt: p.recorded_at }));
}

export async function getCatalogStats(): Promise<{
  modelCount: number;
  brandCount: number;
  merchantCount: number;
}> {
  if (!isSupabaseConfigured()) return { modelCount: 0, brandCount: 0, merchantCount: 0 };

  const supabase = createSupabasePublicClient();
  const [{ count: modelCount }, { count: merchantCount }, brands] = await Promise.all([
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .is("deleted_at", null),
    supabase.from("merchants").select("id", { count: "exact", head: true }).eq("is_self", false),
    getBrands(),
  ]);

  return {
    modelCount: modelCount ?? 0,
    brandCount: brands.length,
    merchantCount: merchantCount ?? 0,
  };
}
