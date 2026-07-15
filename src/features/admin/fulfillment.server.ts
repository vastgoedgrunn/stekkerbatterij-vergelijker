import "server-only";
import { clientEnv } from "@/lib/env/client";
import { sendEmail } from "@/lib/email/provider";
import { shippingEmail } from "@/lib/email/templates";
import { getOrderSummary } from "@/features/checkout/orders.server";
import { getAdminDb } from "./db.server";
import type {
  ApprovalActionKind,
  ApprovalActionRow,
  ApprovalActionStatus,
  ShipmentRow,
} from "@/lib/db/database.types";

export async function listOrderApprovalActions(orderId: string): Promise<ApprovalActionRow[]> {
  const db = getAdminDb();
  const { data, error } = await db
    .from("approval_actions")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .returns<ApprovalActionRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listOrderShipments(orderId: string): Promise<ShipmentRow[]> {
  const db = getAdminDb();
  const { data, error } = await db
    .from("shipments")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at")
    .returns<ShipmentRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Keurt een pending actie goed en verstuurt de e-mail (best-effort). */
export async function approveAndSendAction(
  actionId: string,
  approvedBy: string,
): Promise<{ sent: boolean; error?: string }> {
  const db = getAdminDb();
  const { data: action, error } = await db
    .from("approval_actions")
    .select("*")
    .eq("id", actionId)
    .eq("status", "pending")
    .maybeSingle<ApprovalActionRow>();

  if (error || !action) return { sent: false, error: "Actie niet gevonden." };
  if (action.kind === "refund" || action.kind === "support_reply") {
    return { sent: false, error: "Gebruik de dedicated goedkeuringsflow." };
  }
  if (!action.recipient_email || !action.email_subject || !action.email_body_html) {
    return { sent: false, error: "E-mailinhoud ontbreekt." };
  }

  const result = await sendEmail({
    to: action.recipient_email,
    subject: action.email_subject,
    html: action.email_body_html,
    text: action.email_body_text ?? "",
  });

  const nextStatus: ApprovalActionStatus = result.sent ? "sent" : "approved";
  await db
    .from("approval_actions")
    .update({
      status: nextStatus,
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      sent_at: result.sent ? new Date().toISOString() : null,
    } as never)
    .eq("id", actionId);

  if (action.kind === "supplier_order_email" && action.shipment_id && result.sent) {
    await db
      .from("shipments")
      .update({ status: "label_created" } as never)
      .eq("id", action.shipment_id);
  }

  return { sent: result.sent, error: result.error };
}

/** Admin markeert verzending + stuurt track&trace naar klant (admin-actie = goedkeuring). */
export async function markShipmentShipped(input: {
  shipmentId: string;
  orderId: string;
  carrier: string;
  trackingCode: string;
  trackingUrl: string | null;
  approvedBy: string;
}): Promise<{ sent: boolean }> {
  const db = getAdminDb();
  const shippedAt = new Date().toISOString();

  await db
    .from("shipments")
    .update({
      status: "shipped",
      carrier: input.carrier,
      tracking_code: input.trackingCode,
      tracking_url: input.trackingUrl,
      shipped_at: shippedAt,
    } as never)
    .eq("id", input.shipmentId);

  await db
    .from("orders")
    .update({ status: "shipped" } as never)
    .eq("id", input.orderId);

  const summary = await getOrderSummary(input.orderId);
  if (!summary) return { sent: false };

  const baseUrl = clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const message = shippingEmail({
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
    statusUrl: `${baseUrl}/bestelling/${input.orderId}`,
    carrier: input.carrier,
    trackingCode: input.trackingCode,
    trackingUrl: input.trackingUrl,
  });

  const result = await sendEmail(message);

  await db.from("approval_actions").insert({
    kind: "shipment_tracking_email",
    status: result.sent ? "sent" : "approved",
    order_id: input.orderId,
    shipment_id: input.shipmentId,
    summary: `Track & trace naar klant voor #${summary.orderNumber}`,
    recipient_email: summary.email,
    email_subject: message.subject,
    email_body_html: message.html,
    email_body_text: message.text,
    approved_by: input.approvedBy,
    approved_at: shippedAt,
    sent_at: result.sent ? shippedAt : null,
    payload: {
      carrier: input.carrier,
      tracking_code: input.trackingCode,
      tracking_url: input.trackingUrl,
    },
  } as never);

  return { sent: result.sent };
}

export function approvalKindLabel(kind: ApprovalActionKind): string {
  switch (kind) {
    case "supplier_order_email":
      return "Leverancier-order";
    case "shipment_tracking_email":
      return "Track & trace";
    case "support_reply":
      return "Support-antwoord";
    case "refund":
      return "Terugbetaling";
    default:
      return kind;
  }
}
