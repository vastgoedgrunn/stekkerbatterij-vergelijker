import type { ProductImageStatus, ProductType, StockStatus } from "@/lib/db/database.types";

export type { ProductType, ProductImageStatus };

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface ProductRating {
  average: number | null;
  count: number;
}

export interface ProductListBestOffer {
  id: string;
  merchantName: string;
  priceCents: number;
  affiliateUrl: string | null;
  isSponsored: boolean;
  estimatedCommissionCents: number | null;
}

export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  brand: Brand;
  summary: string | null;
  capacityKwh: number | null;
  powerKw: number | null;
  cycles: number | null;
  warrantyYears: number | null;
  expandable: boolean;
  imagePath: string | null;
  imageStatus: ProductImageStatus;
  productType: ProductType;
  indicativePriceMinCents: number | null;
  indicativePriceMaxCents: number | null;
  lowestPriceCents: number | null;
  offerCount: number;
  bestOffer: ProductListBestOffer | null;
  rating: ProductRating;
}

export interface ProductSpec {
  key: string;
  label: string;
  unit: string | null;
  value: string;
}

export interface ProductOffer {
  id: string;
  merchantName: string;
  merchantSlug: string;
  isSelf: boolean;
  isSponsored: boolean;
  priceCents: number;
  stockStatus: StockStatus;
  deliveryDays: number | null;
  affiliateUrl: string | null;
  lastCheckedAt: string | null;
  estimatedCommissionCents: number | null;
}

export interface PricePoint {
  priceCents: number;
  recordedAt: string;
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  /** Dropship-leverancier; gezet = verkoopbaar via de eigen shop (fase 2). */
  supplierId: string | null;
  /** Per-product checkout wanneer sellable + checkout-flag aan. */
  sellable: boolean;
  categories: Category[];
  specs: ProductSpec[];
  offers: ProductOffer[];
  priceHistory: PricePoint[];
}

export type ProductSort =
  "relevance" | "price_asc" | "price_desc" | "value_asc" | "capacity_desc" | "rating_desc";

export interface ProductFilters {
  search?: string;
  brandSlug?: string;
  categorySlug?: string;
  /** Filter op stekker (plug_in) of vaste thuisbatterij (fixed). */
  productType?: ProductType;
  minCapacity?: number;
  maxCapacity?: number;
  /** Laagste prijs in euro's. */
  minPrice?: number;
  maxPrice?: number;
  expandableOnly?: boolean;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

export interface ProductListResult {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
}
