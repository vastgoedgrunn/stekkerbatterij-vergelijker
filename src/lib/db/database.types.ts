/**
 * Databasetypes die exact het SQL-schema (db/migrations) weerspiegelen.
 * Handmatig onderhouden; te regenereren met de Supabase type-generator
 * zodra het project live is (`supabase gen types`). Basis voor de
 * type-veilige Supabase-client.
 */
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type AppRole = "user" | "editor" | "merchant_manager" | "moderator" | "admin";
export type ProductStatus = "draft" | "published" | "archived";
export type StockStatus = "in_stock" | "out_of_stock" | "preorder" | "unknown";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type ContentStatus = "draft" | "in_review" | "published" | "archived";

interface TimestampFields {
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface BrandRow extends TimestampFields {
  id: string;
  name: string;
  slug: string;
  logo_path: string | null;
  website_url: string | null;
}

export interface CategoryRow extends TimestampFields {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

export interface ProductRow extends TimestampFields {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  status: ProductStatus;
  capacity_kwh: number | null;
  power_kw: number | null;
  cycles: number | null;
  warranty_years: number | null;
  expandable: boolean;
  image_path: string | null;
  published_at: string | null;
}

export interface MerchantRow extends TimestampFields {
  id: string;
  name: string;
  slug: string;
  is_self: boolean;
  website_url: string | null;
}

export interface OfferRow extends TimestampFields {
  id: string;
  product_id: string;
  merchant_id: string;
  price_cents: number;
  currency: string;
  stock_status: StockStatus;
  delivery_days: number | null;
  affiliate_url: string | null;
  affiliate_network: string | null;
  affiliate_params: Json | null;
  is_sponsored: boolean;
  last_checked_at: string;
}

export interface OfferClickRow {
  id: string;
  offer_id: string;
  product_id: string | null;
  merchant_id: string | null;
  referrer: string | null;
  user_agent: string | null;
  session_hash: string | null;
  created_at: string;
}

export interface PriceHistoryRow {
  id: string;
  offer_id: string;
  price_cents: number;
  recorded_at: string;
}

export interface ReviewRow extends TimestampFields {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string;
  status: ReviewStatus;
}

export interface SpecDefinitionRow {
  id: string;
  key: string;
  label: string;
  unit: string | null;
  data_type: "number" | "text" | "boolean";
  sort_order: number;
}

export interface ProductSpecRow {
  product_id: string;
  spec_id: string;
  value_number: number | null;
  value_text: string | null;
  value_boolean: boolean | null;
}

export interface ContentArticleRow extends TimestampFields {
  id: string;
  author_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  body: Json;
  cover_image_path: string | null;
  status: ContentStatus;
  published_at: string | null;
}

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  product_id: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductRatingStatsRow {
  product_id: string;
  avg_rating: number | null;
  review_count: number;
}

export interface FavoriteRow {
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface PriceAlertRow {
  id: string;
  user_id: string;
  product_id: string;
  threshold_cents: number;
  active: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

export interface UserRoleRow {
  user_id: string;
  role: AppRole;
  created_at: string;
}

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      brands: Table<BrandRow>;
      categories: Table<CategoryRow>;
      products: Table<ProductRow>;
      merchants: Table<MerchantRow>;
      offers: Table<OfferRow>;
      offer_clicks: Table<OfferClickRow>;
      price_history: Table<PriceHistoryRow>;
      reviews: Table<ReviewRow>;
      spec_definitions: Table<SpecDefinitionRow>;
      product_specs: Table<ProductSpecRow>;
      content_articles: Table<ContentArticleRow>;
      faqs: Table<FaqRow>;
      favorites: Table<FavoriteRow>;
      price_alerts: Table<PriceAlertRow>;
      user_roles: Table<UserRoleRow>;
      product_categories: Table<{ product_id: string; category_id: string }>;
    };
    Views: {
      product_rating_stats: {
        Row: ProductRatingStatsRow;
        Relationships: [];
      };
    };
    Functions: {
      has_role: { Args: { r: AppRole }; Returns: boolean };
      refresh_product_rating_stats: { Args: Record<string, never>; Returns: undefined };
    };
    Enums: {
      app_role: AppRole;
    };
    CompositeTypes: Record<string, never>;
  };
}
