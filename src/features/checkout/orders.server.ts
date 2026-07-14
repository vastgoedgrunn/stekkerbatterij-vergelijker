import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { serverEnv } from "@/lib/env/server";
import { logger } from "@/lib/observability/logger";
import type { OrderSummary, OrderSummaryLine } from "./types";
import type { OrderStatus, PaymentStatus } from "@/lib/db/database.types";

interface RawOrder {
  id: string;
  order_number: number;
  invoice_number: number | null;
  email: string;
  status: OrderStatus;
  currency: string;
  vat_rate: number;
  subtotal_cents: number;
  vat_cents: number;
  total_cents: number;
  placed_at: string;
  paid_at: string | null;
  order_lines:
    | {
        id: string;
        name: string;
        sku: string | null;
        quantity: number;
        unit_price_cents: number;
        line_total_cents: number;
      }[]
    | null;
  payments: { status: PaymentStatus; method: string | null; checkout_url: string | null }[] | null;
}

/**
 * Leest een order voor de publieke statuspagina. Gast-orders zijn niet via RLS
 * leesbaar, dus dit gebeurt server-side via de service-role client op basis van
 * de niet-raadbare order-UUID. Wordt uitsluitend in server components/acties
 * gebruikt (`.server.ts`, geen client-import).
 */
export async function getOrderSummary(orderId: string): Promise<OrderSummary | null> {
  if (!isSupabaseConfigured() || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) return null;

  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from("orders")
    .select(
      "id, order_number, invoice_number, email, status, currency, vat_rate, subtotal_cents, vat_cents, total_cents, placed_at, paid_at, order_lines(id, name, sku, quantity, unit_price_cents, line_total_cents), payments(status, method, checkout_url)",
    )
    .eq("id", orderId)
    .limit(1)
    .returns<RawOrder[]>();

  if (error) {
    logger.warn("Kon order niet laden", { message: error.message });
    return null;
  }

  const order = data?.[0];
  if (!order) return null;

  const lines: OrderSummaryLine[] = (order.order_lines ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    sku: l.sku,
    quantity: l.quantity,
    unitPriceCents: l.unit_price_cents,
    lineTotalCents: l.line_total_cents,
  }));

  // Meest recente betaling (voor de weergegeven status).
  const payment = order.payments?.[0] ?? null;

  return {
    id: order.id,
    orderNumber: order.order_number,
    invoiceNumber: order.invoice_number,
    email: order.email,
    status: order.status,
    currency: order.currency,
    vatRate: order.vat_rate,
    subtotalCents: order.subtotal_cents,
    vatCents: order.vat_cents,
    totalCents: order.total_cents,
    placedAt: order.placed_at,
    paidAt: order.paid_at,
    lines,
    payment: payment
      ? { status: payment.status, method: payment.method, checkoutUrl: payment.checkout_url }
      : null,
  };
}
