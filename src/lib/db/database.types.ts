/**
 * Databasetypes die exact het SQL-schema (db/migrations) weerspiegelen.
 * Handmatig onderhouden; te regenereren met de Supabase type-generator
 * zodra het project live is (`supabase gen types`). Basis voor de
 * type-veilige Supabase-client.
 */
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type AppRole = "user" | "editor" | "merchant_manager" | "moderator" | "admin";
export type ProductStatus = "draft" | "published" | "archived";
/** plug_in = stekkerbatterij (CPS); fixed = vaste thuisbatterij (lead/offerte). */
export type ProductType = "plug_in" | "fixed" | "accessory";
export type StockStatus = "in_stock" | "out_of_stock" | "preorder" | "unknown";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type ContentStatus = "draft" | "in_review" | "published" | "archived";
export type MarketScoreScope = "sku" | "brand";

/** Commerce (fase 2). */
export type OrderStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded" | "shipped";
export type PaymentStatus =
  "open" | "pending" | "authorized" | "paid" | "failed" | "canceled" | "expired" | "refunded";
export type ShipmentStatus = "pending" | "label_created" | "shipped" | "delivered" | "cancelled";

/** Admin/ops (fase 3). */
export type ChangeRequestStatus = "pending" | "approved" | "rejected" | "applied";
export type ApprovalActionKind =
  "supplier_order_email" | "shipment_tracking_email" | "support_reply" | "refund";
export type ApprovalActionStatus = "pending" | "approved" | "rejected" | "sent" | "cancelled";
export type SupportTicketStatus = "open" | "awaiting_reply" | "resolved" | "closed";

/** Monetization (fase 1+). */
export type CommissionType = "cps" | "cpa";
export type LeadStatus = "new" | "approved" | "sent" | "converted" | "rejected";
/** Affiliate hybrid: netwerk nog niet live / kapotte check. */
export type AffiliateLinkStatus = "ok" | "pending" | "broken";

/** Catalog Discovery Engine. */
export type CatalogCandidateStatus =
  "discovered" | "matched" | "needs_review" | "upserted" | "published" | "rejected";
export type CatalogCandidateSource = "bol" | "merchant" | "research" | "manual";

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
  sku: string | null;
  ean: string | null;
  cost_cents: number | null;
  supplier_id: string | null;
  handling_days: number;
  weight_grams: number | null;
  sellable: boolean;
  product_type: ProductType;
  indicative_price_min_cents: number | null;
  indicative_price_max_cents: number | null;
  market_score_average: number | null;
  market_score_count: number | null;
  market_score_source_name: string | null;
  market_score_source_url: string | null;
  market_score_scope: MarketScoreScope | null;
  market_score_checked_at: string | null;
}

export interface MerchantRow extends TimestampFields {
  id: string;
  name: string;
  slug: string;
  is_self: boolean;
  website_url: string | null;
  default_affiliate_network: string | null;
  network_publisher_id: string | null;
  deeplink_param_template: Json | null;
}

export interface CatalogRunRow {
  id: string;
  started_at: string;
  finished_at: string | null;
  trigger_source: string;
  stats: Json;
  error_message: string | null;
  created_at: string;
}

export interface CatalogCandidateRow {
  id: string;
  run_id: string | null;
  source: CatalogCandidateSource;
  external_id: string | null;
  brand_slug: string | null;
  raw_title: string;
  raw_description: string | null;
  capacity_kwh: number | null;
  power_kw: number | null;
  url: string;
  image_url: string | null;
  price_cents: number | null;
  currency: string;
  match_score: number | null;
  match_notes: string | null;
  status: CatalogCandidateStatus;
  product_id: string | null;
  offer_id: string | null;
  payload: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
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
  affiliate_deeplink: string | null;
  affiliate_network: string | null;
  affiliate_params: Json | null;
  commission_type: CommissionType | null;
  commission_rate: number | null;
  commission_cents_fixed: number | null;
  last_commission_verified_at: string | null;
  commission_source_url: string | null;
  affiliate_link_status: AffiliateLinkStatus;
  affiliate_link_checked_at: string | null;
  affiliate_link_note: string | null;
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
  click_ref: string | null;
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

// ---------------------------------------------------------------------------
// Commerce (fase 2)
// ---------------------------------------------------------------------------
export interface SupplierRow extends TimestampFields {
  id: string;
  name: string;
  slug: string;
  contact_email: string | null;
  website_url: string | null;
}

export interface AddressRow {
  id: string;
  user_id: string | null;
  full_name: string;
  company: string | null;
  line1: string;
  line2: string | null;
  postal_code: string;
  city: string;
  country: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderRow {
  id: string;
  order_number: number;
  invoice_number: number | null;
  user_id: string | null;
  email: string;
  status: OrderStatus;
  currency: string;
  vat_rate: number;
  subtotal_cents: number;
  vat_cents: number;
  total_cents: number;
  shipping_address_id: string | null;
  billing_address_id: string | null;
  notes: string | null;
  placed_at: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderLineRow {
  id: string;
  order_id: string;
  product_id: string | null;
  offer_id: string | null;
  sku: string | null;
  name: string;
  quantity: number;
  unit_price_cents: number;
  vat_rate: number;
  line_total_cents: number;
  created_at: string;
}

export interface PaymentRow {
  id: string;
  order_id: string;
  provider: string;
  provider_payment_id: string | null;
  status: PaymentStatus;
  amount_cents: number;
  currency: string;
  method: string | null;
  checkout_url: string | null;
  paid_at: string | null;
  raw: Json | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentRow {
  id: string;
  order_id: string;
  supplier_id: string | null;
  status: ShipmentStatus;
  carrier: string | null;
  tracking_code: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChangeRequestRow {
  id: string;
  kind: string;
  target_table: string | null;
  target_id: string | null;
  summary: string;
  proposed: Json;
  source: string;
  source_url: string | null;
  status: ChangeRequestStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalActionRow {
  id: string;
  kind: ApprovalActionKind;
  status: ApprovalActionStatus;
  order_id: string | null;
  shipment_id: string | null;
  support_ticket_id: string | null;
  summary: string;
  payload: Json;
  recipient_email: string | null;
  email_subject: string | null;
  email_body_html: string | null;
  email_body_text: string | null;
  requested_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  sent_at: string | null;
  rejection_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketRow {
  id: string;
  order_id: string | null;
  customer_email: string;
  subject: string;
  body: string;
  status: SupportTicketStatus;
  source: string;
  external_message_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportReplyRow {
  id: string;
  ticket_id: string;
  draft_body: string;
  approval_action_id: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface PartnerProgramRow extends TimestampFields {
  id: string;
  slug: string;
  name: string;
  network: string;
  program_id: string | null;
  /** Daisycon li-parameter; verplicht voor live glp8.net-deeplinks. */
  link_id: string | null;
  commission_type: CommissionType;
  commission_rate: number | null;
  commission_cents_min: number | null;
  commission_cents_max: number | null;
  cookie_days: number | null;
  signup_url: string | null;
  notes: string | null;
  source_url: string | null;
}

export interface EnergyPartnerRow extends TimestampFields {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  affiliate_url: string;
  affiliate_network: string | null;
  affiliate_params: Json | null;
  commission_type: CommissionType;
  commission_cents_min: number | null;
  commission_cents_max: number | null;
  commission_source_url: string | null;
  sort_order: number;
  active: boolean;
}

export interface LeadRow extends TimestampFields {
  id: string;
  source: string;
  customer_name: string | null;
  customer_email: string;
  phone: string | null;
  postal_code: string | null;
  qualification: Json;
  status: LeadStatus;
  partner_slug: string | null;
  estimated_commission_cents: number | null;
  notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  sent_at: string | null;
  product_id: string | null;
}

export interface EnergyClickRow {
  id: string;
  energy_partner_id: string;
  click_ref: string;
  referrer: string | null;
  user_agent: string | null;
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
      suppliers: Table<SupplierRow>;
      addresses: Table<AddressRow>;
      orders: Table<OrderRow>;
      order_lines: Table<OrderLineRow>;
      payments: Table<PaymentRow>;
      shipments: Table<ShipmentRow>;
      change_requests: Table<ChangeRequestRow>;
      approval_actions: Table<ApprovalActionRow>;
      support_tickets: Table<SupportTicketRow>;
      support_replies: Table<SupportReplyRow>;
      partner_programs: Table<PartnerProgramRow>;
      energy_partners: Table<EnergyPartnerRow>;
      leads: Table<LeadRow>;
      energy_clicks: Table<EnergyClickRow>;
      catalog_runs: Table<CatalogRunRow>;
      catalog_candidates: Table<CatalogCandidateRow>;
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
      next_invoice_number: { Args: Record<string, never>; Returns: number };
    };
    Enums: {
      app_role: AppRole;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      shipment_status: ShipmentStatus;
      change_request_status: ChangeRequestStatus;
      approval_action_kind: ApprovalActionKind;
      approval_action_status: ApprovalActionStatus;
      support_ticket_status: SupportTicketStatus;
      commission_type: CommissionType;
      lead_status: LeadStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
