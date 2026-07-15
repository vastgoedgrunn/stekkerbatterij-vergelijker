"use server";

import { revalidatePath } from "next/cache";
import { canManageOrders, getUserRoles, requireAdminUser } from "@/features/auth/rbac";
import {
  createManualSupportTicket,
  draftSupportReply,
  executeApprovedRefund,
  requestRefundApproval,
  sendApprovedSupportReply,
} from "./support.server";

async function assertSupportAccess(): Promise<string> {
  const user = await requireAdminUser();
  const roles = await getUserRoles(user.id);
  if (!canManageOrders(roles)) throw new Error("Geen rechten.");
  return user.id;
}

export async function createSupportTicketAction(formData: FormData): Promise<void> {
  try {
    await assertSupportAccess();
    const customerEmail = String(formData.get("customerEmail") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();
    const orderId = String(formData.get("orderId") ?? "").trim() || null;
    if (!customerEmail || !subject || !body) return;

    await createManualSupportTicket({ customerEmail, subject, body, orderId });
    revalidatePath("/admin/support");
  } catch {
    // Auth redirect.
  }
}

export async function draftSupportReplyAction(formData: FormData): Promise<void> {
  try {
    await assertSupportAccess();
    const ticketId = String(formData.get("ticketId") ?? "");
    const draftBody = String(formData.get("draftBody") ?? "").trim();
    if (!ticketId || !draftBody) return;

    await draftSupportReply(ticketId, draftBody);
    revalidatePath(`/admin/support/${ticketId}`);
    revalidatePath("/admin/support");
  } catch {
    // Auth redirect.
  }
}

export async function approveSupportReplyAction(formData: FormData): Promise<void> {
  try {
    const userId = await assertSupportAccess();
    const actionId = String(formData.get("actionId") ?? "");
    const ticketId = String(formData.get("ticketId") ?? "");
    if (!actionId) return;

    await sendApprovedSupportReply(actionId, userId);
    if (ticketId) revalidatePath(`/admin/support/${ticketId}`);
    revalidatePath("/admin/support");
  } catch {
    // Auth redirect.
  }
}

export async function requestRefundAction(formData: FormData): Promise<void> {
  try {
    await assertSupportAccess();
    const orderId = String(formData.get("orderId") ?? "");
    const reason = String(formData.get("reason") ?? "").trim() || "Klantverzoek";
    if (!orderId) return;

    await requestRefundApproval(orderId, reason);
    revalidatePath(`/admin/orders/${orderId}`);
  } catch {
    // Auth redirect.
  }
}

export async function approveRefundAction(formData: FormData): Promise<void> {
  try {
    const userId = await assertSupportAccess();
    const actionId = String(formData.get("actionId") ?? "");
    const orderId = String(formData.get("orderId") ?? "");
    if (!actionId) return;

    await executeApprovedRefund(actionId, userId);
    if (orderId) revalidatePath(`/admin/orders/${orderId}`);
  } catch {
    // Auth redirect.
  }
}
