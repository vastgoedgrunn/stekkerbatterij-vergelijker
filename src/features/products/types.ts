import type { StockStatus } from "@/lib/db/database.types";

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
  lowestPriceCents: number | null;
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
}

export interface PricePoint {
  priceCents: number;
  recordedAt: string;
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  categories: Category[];
  specs: ProductSpec[];
  offers: ProductOffer[];
  priceHistory: PricePoint[];
}

export type ProductSort =
  "relevance" | "price_asc" | "price_desc" | "capacity_desc" | "rating_desc";

export interface ProductFilters {
  search?: string;
  brandSlug?: string;
  categorySlug?: string;
  minCapacity?: number;
  maxCapacity?: number;
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
