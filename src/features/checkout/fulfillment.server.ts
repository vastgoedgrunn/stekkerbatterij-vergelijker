import "server-only";
import { PaymentStatus as MolliePaymentStatus } from "@mollie/api-client";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { serverEnv } from "@/lib/env/server";
import { clientEnv } from "@/lib/env/client";
import { getMollieClient, isMollieConfigured } from "@/lib/payments/mollie";
import { sendEmail } from "@/lib/email/provider";
import { orderConfirmationEmail, paymentFailedEmail } from "@/lib/email/templates";
import { logger } from "@/lib/observability/logger";
import { getOrderSummary } from "./orders.server";
import type { OrderEmailData } from "@/lib/email/types";
import type { Json, OrderStatus, PaymentStatus } from "@/lib/db/database.types";

export type FulfillmentResult =
  | { handled: true; orderId: string; orderStatus: OrderStatus; becamePaid: boolean }
  | { handled: false; reason: string };

/**
 * Vertaalt een Mollie-betaalstatus naar onze order- en betaalstatus. De Mollie-
 * statuswaarden vallen 1-op-1 binnen onze `payment_status`-enum.
 */
function mapStatus(mollieStatus: string): { order: OrderStatus; payment: PaymentStatus } {
  switch (mollieStatus) {
    case MolliePaymentStatus.paid:
      return { order: "paid", payment: "paid" };
    case MolliePaymentStatus.failed:
      return { order: "failed", payment: "failed" };
    case MolliePaymentStatus.canceled:
      return { order: "cancelled", payment: "canceled" };
    case MolliePaymentStatus.expired:
      return { order: "failed", payment: "expired" };
    case MolliePaymentStatus.authorized:
      return { order: "pending", payment: "authorized" };
    case MolliePaymentStatus.pending:
      return { order: "pending", payment: "pending" };
    default:
      return { order: "pending", payment: "open" };
  }
}

/**
 * Verwerkt een Mollie-webhookmelding: haalt de betaling opnieuw op bij Mollie
 * (nooit de payload vertrouwen), koppelt via metadata.order_id, en werkt order
 * + betaling bij via de service-role client. Idempotent: een order wordt maar
 * één keer op `paid` gezet en krijgt dan één factuurnummer.
 */
export async function processMolliePayment(molliePaymentId: string): Promise<FulfillmentResult> {
  if (!isMollieConfigured() || !isSupabaseConfigured() || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    return { handled: false, reason: "not-configured" };
  }

  const payment = await getMollieClient().payments.get(molliePaymentId);
  const orderId =
    typeof payment.metadata === "object" &&
    payment.metadata !== null &&
    "order_id" in payment.metadata
      ? String((payment.metadata as { order_id: unknown }).order_id)
      : null;

  if (!orderId) {
    return { handled: false, reason: "no-order-id" };
  }

  const service = createSupabaseServiceClient();
  const { order: nextOrderStatus, payment: nextPaymentStatus } = mapStatus(payment.status);

  // Betaling opslaan/bijwerken (upsert op provider_payment_id).
  const paymentPayload = {
    order_id: orderId,
    provider: "mollie",
    provider_payment_id: payment.id,
    status: nextPaymentStatus,
    amount_cents: Math.round(Number(payment.amount.value) * 100),
    currency: payment.amount.currency,
    method: payment.method ?? null,
    paid_at: payment.paidAt ?? null,
    raw: payment as unknown as Json,
  };
  const { error: paymentError } = await service
    .from("payments")
    .upsert(paymentPayload as never, { onConflict: "provider_payment_id" });
  if (paymentError) {
    logger.warn("Kon betaling niet bijwerken", { message: paymentError.message, orderId });
  }

  // Huidige orderstatus lezen voor idempotentie.
  const { data: current, error: readError } = await service
    .from("orders")
    .select("status, invoice_number")
    .eq("id", orderId)
    .single<{ status: OrderStatus; invoice_number: number | null }>();

  if (readError || !current) {
    logger.warn("Kon order niet lezen in webhook", { message: readError?.message, orderId });
    return { handled: false, reason: "order-not-found" };
  }

  const becamePaid = nextOrderStatus === "paid" && current.status !== "paid";
  const becameFailed = nextOrderStatus === "failed" && current.status !== "failed";

  const orderUpdate: Record<string, unknown> = { status: nextOrderStatus };
  if (becamePaid) {
    orderUpdate.paid_at = payment.paidAt ?? new Date().toISOString();
    if (current.invoice_number === null) {
      const { data: invoiceNo, error: rpcError } = await service.rpc("next_invoice_number");
      if (rpcError) {
        logger.warn("Kon factuurnummer niet toewijzen", { message: rpcError.message, orderId });
      } else if (typeof invoiceNo === "number") {
        orderUpdate.invoice_number = invoiceNo;
      }
    }
  }

  const { error: updateError } = await service
    .from("orders")
    .update(orderUpdate as never)
    .eq("id", orderId);
  if (updateError) {
    logger.warn("Kon order niet bijwerken", { message: updateError.message, orderId });
    return { handled: false, reason: "update-failed" };
  }

  // Transactionele e-mail (best-effort; mag de webhook nooit breken).
  if (becamePaid) {
    await sendOrderEmail(orderId, "paid");
  } else if (becameFailed) {
    await sendOrderEmail(orderId, "failed");
  }

  return { handled: true, orderId, orderStatus: nextOrderStatus, becamePaid };
}

/**
 * Stuurt de order-bevestiging of betaling-mislukt-mail. No-op wanneer e-mail
 * niet geconfigureerd is (dat regelt de provider zelf). Gooit nooit.
 */
async function sendOrderEmail(orderId: string, kind: "paid" | "failed"): Promise<void> {
  try {
    const summary = await getOrderSummary(orderId);
    if (!summary) return;

    const baseUrl = clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    const data: OrderEmailData = {
      orderNumber: summary.orderNumber,
      invoiceNumber: summary.invoiceNumber,
      email: summary.email,
      currency: summary.currency,
      vatRate: summary.vatRate,
      subtotalCents: summary.subtotalCents,
      vatCents: summary.vatCents,
      totalCents: summary.totalCents,
      lines: summary.lines.map((l) => ({
        name: l.name,
        quantity: l.quantity,
        lineTotalCents: l.lineTotalCents,
      })),
      statusUrl: `${baseUrl}/bestelling/${orderId}`,
    };

    const message = kind === "paid" ? orderConfirmationEmail(data) : paymentFailedEmail(data);
    await sendEmail(message);
  } catch (error) {
    logger.warn("Kon order-e-mail niet versturen", {
      orderId,
      message: error instanceof Error ? error.message : "onbekend",
    });
  }
}
