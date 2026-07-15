import "server-only";
import { isEmailConfigured } from "@/lib/email/provider";
import { sendEmail } from "@/lib/email/provider";
import { siteConfig } from "@/config/site";
import { getMollieClient, isMollieConfigured, toMollieAmountValue } from "@/lib/payments/mollie";
import { getAdminDb } from "@/features/admin/db.server";
import type { SupportTicketRow, SupportTicketStatus } from "@/lib/db/database.types";

export function isSupportInboundConfigured(): boolean {
  // Live inbound (Gmail/Workspace/helpdesk) volgt in een latere integratie.
  return false;
}

export async function listSupportTickets(limit = 50): Promise<SupportTicketRow[]> {
  const db = getAdminDb();
  const { data, error } = await db
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<SupportTicketRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getSupportTicket(id: string): Promise<SupportTicketRow | null> {
  const db = getAdminDb();
  const { data, error } = await db
    .from("support_tickets")
    .select("*")
    .eq("id", id)
    .maybeSingle<SupportTicketRow>();
  if (error) throw new Error(error.message);
  return data;
}

export async function createManualSupportTicket(input: {
  customerEmail: string;
  subject: string;
  body: string;
  orderId?: string | null;
}): Promise<string> {
  const db = getAdminDb();
  const { data, error } = await db
    .from("support_tickets")
    .insert({
      customer_email: input.customerEmail,
      subject: input.subject,
      body: input.body,
      order_id: input.orderId ?? null,
      source: "manual",
      status: "open",
    } as never)
    .select("id")
    .single<{ id: string }>();
  if (error || !data) throw new Error(error?.message ?? "Ticket aanmaken mislukt.");
  return data.id;
}

/** Slaat een concept-antwoord op en zet het klaar voor goedkeuring (nog niet verstuurd). */
export async function draftSupportReply(ticketId: string, draftBody: string): Promise<void> {
  const db = getAdminDb();
  const ticket = await getSupportTicket(ticketId);
  if (!ticket) throw new Error("Ticket niet gevonden.");

  const subject = `Re: ${ticket.subject}`;
  const html = `<p>${draftBody.replace(/\n/g, "<br/>")}</p>`;
  const text = draftBody;

  const { data: action, error: actionError } = await db
    .from("approval_actions")
    .insert({
      kind: "support_reply",
      status: "pending",
      support_ticket_id: ticketId,
      order_id: ticket.order_id,
      summary: `Support-antwoord aan ${ticket.customer_email}`,
      recipient_email: ticket.customer_email,
      email_subject: subject,
      email_body_html: html,
      email_body_text: text,
      payload: { ticket_id: ticketId },
    } as never)
    .select("id")
    .single<{ id: string }>();

  if (actionError || !action) throw new Error(actionError?.message ?? "Concept opslaan mislukt.");

  await db.from("support_replies").insert({
    ticket_id: ticketId,
    draft_body: draftBody,
    approval_action_id: action.id,
  } as never);

  await db
    .from("support_tickets")
    .update({ status: "awaiting_reply" as SupportTicketStatus } as never)
    .eq("id", ticketId);
}

/** Verstuurt een goedgekeurd support-antwoord (no-op zonder e-mailconfig). */
export async function sendApprovedSupportReply(
  actionId: string,
  approvedBy: string,
): Promise<{ sent: boolean }> {
  if (!isEmailConfigured()) return { sent: false };

  const db = getAdminDb();
  const { data: action, error } = await db
    .from("approval_actions")
    .select("*")
    .eq("id", actionId)
    .eq("kind", "support_reply")
    .eq("status", "pending")
    .maybeSingle<{
      id: string;
      support_ticket_id: string | null;
      recipient_email: string | null;
      email_subject: string | null;
      email_body_html: string | null;
      email_body_text: string | null;
    }>();

  if (error || !action?.recipient_email || !action.email_subject || !action.email_body_html) {
    return { sent: false };
  }

  const result = await sendEmail({
    to: action.recipient_email,
    subject: action.email_subject,
    html: action.email_body_html,
    text: action.email_body_text ?? "",
  });

  const sentAt = result.sent ? new Date().toISOString() : null;
  await db
    .from("approval_actions")
    .update({
      status: result.sent ? "sent" : "approved",
      approved_by: approvedBy,
      approved_at: sentAt ?? new Date().toISOString(),
      sent_at: sentAt,
    } as never)
    .eq("id", actionId);

  if (action.support_ticket_id) {
    await db
      .from("support_tickets")
      .update({ status: "resolved" } as never)
      .eq("id", action.support_ticket_id);
    await db
      .from("support_replies")
      .update({ sent_at: sentAt } as never)
      .eq("approval_action_id", actionId);
  }

  return { sent: result.sent };
}

/**
 * Maakt een refund-verzoek aan ter goedkeuring. Uitvoering via Mollie pas na
 * expliciete admin-goedkeuring (geld = altijd menselijke poort).
 */
export async function requestRefundApproval(orderId: string, reason: string): Promise<void> {
  const db = getAdminDb();
  const { data: order, error: orderError } = await db
    .from("orders")
    .select("id, order_number, total_cents, currency, email, status")
    .eq("id", orderId)
    .maybeSingle<{
      id: string;
      order_number: number;
      total_cents: number;
      currency: string;
      email: string;
      status: string;
    }>();
  if (orderError || !order) throw new Error("Order niet gevonden.");
  if (order.status !== "paid" && order.status !== "shipped") {
    throw new Error("Alleen betaalde/verzonden orders kunnen terugbetaald worden.");
  }

  const { data: payment } = await db
    .from("payments")
    .select("provider_payment_id, amount_cents")
    .eq("order_id", orderId)
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ provider_payment_id: string | null; amount_cents: number }>();

  await db.from("approval_actions").insert({
    kind: "refund",
    status: "pending",
    order_id: orderId,
    summary: `Terugbetaling order #${order.order_number} (${reason})`,
    payload: {
      order_number: order.order_number,
      amount_cents: payment?.amount_cents ?? order.total_cents,
      currency: order.currency,
      mollie_payment_id: payment?.provider_payment_id,
      reason,
      customer_email: order.email,
    },
  } as never);
}

/** Voert een goedgekeurde Mollie-refund uit. */
export async function executeApprovedRefund(
  actionId: string,
  approvedBy: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!isMollieConfigured()) return { ok: false, error: "Mollie niet geconfigureerd." };

  const db = getAdminDb();
  const { data: action, error } = await db
    .from("approval_actions")
    .select("*")
    .eq("id", actionId)
    .eq("kind", "refund")
    .eq("status", "pending")
    .maybeSingle<{
      id: string;
      order_id: string | null;
      payload: {
        amount_cents?: number;
        currency?: string;
        mollie_payment_id?: string | null;
      };
    }>();

  if (error || !action) return { ok: false, error: "Refund-actie niet gevonden." };
  const paymentId = action.payload?.mollie_payment_id;
  if (!paymentId) return { ok: false, error: "Geen Mollie-betaling gekoppeld." };

  const amountCents = action.payload?.amount_cents ?? 0;
  const currency = action.payload?.currency ?? "EUR";

  try {
    await getMollieClient().paymentRefunds.create({
      paymentId,
      amount: { currency, value: toMollieAmountValue(amountCents) },
    });
  } catch (refundError) {
    return {
      ok: false,
      error: refundError instanceof Error ? refundError.message : "Mollie-refund mislukt.",
    };
  }

  const now = new Date().toISOString();
  await db
    .from("approval_actions")
    .update({
      status: "sent",
      approved_by: approvedBy,
      approved_at: now,
      sent_at: now,
    } as never)
    .eq("id", actionId);

  if (action.order_id) {
    await db
      .from("orders")
      .update({ status: "refunded" } as never)
      .eq("id", action.order_id);
    await db
      .from("payments")
      .update({ status: "refunded" } as never)
      .eq("provider_payment_id", paymentId);
  }

  return { ok: true };
}

export function supportReplyEmailTemplate(to: string, subject: string, body: string) {
  return {
    to,
    subject: `${subject} — ${siteConfig.name}`,
    html: `<p>${body.replace(/\n/g, "<br/>")}</p>`,
    text: body,
  };
}
