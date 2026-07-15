"use server";

import { revalidatePath } from "next/cache";
import {
  canManageCatalog,
  canManageOrders,
  canReviewChanges,
  getUserRoles,
  requireAdminUser,
} from "@/features/auth/rbac";
import { getAdminDb } from "./db.server";
import { approveAndSendAction, markShipmentShipped } from "./fulfillment.server";
import type { ChangeRequestStatus, CommissionType, ProductStatus } from "@/lib/db/database.types";

async function assertCatalogAccess(): Promise<string> {
  const user = await requireAdminUser();
  const roles = await getUserRoles(user.id);
  if (!canManageCatalog(roles)) throw new Error("Geen rechten voor catalogusbeheer.");
  return user.id;
}

async function assertOrderAccess(): Promise<string> {
  const user = await requireAdminUser();
  const roles = await getUserRoles(user.id);
  if (!canManageOrders(roles)) throw new Error("Geen rechten voor orderbeheer.");
  return user.id;
}

async function assertReviewAccess(): Promise<string> {
  const user = await requireAdminUser();
  const roles = await getUserRoles(user.id);
  if (!canReviewChanges(roles)) throw new Error("Geen rechten voor review.");
  return user.id;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Publieke catalogus-routes na product/offer-mutaties. */
function revalidatePublicCatalog(productSlug?: string | null): void {
  revalidatePath("/");
  revalidatePath("/batterijen");
  if (productSlug) {
    revalidatePath(`/batterijen/${productSlug}`);
  }
}

export async function updateProductCommerceAction(formData: FormData): Promise<void> {
  try {
    await assertCatalogAccess();
    const productId = String(formData.get("productId") ?? "");
    if (!productId) return;

    const sku = String(formData.get("sku") ?? "").trim() || null;
    const ean = String(formData.get("ean") ?? "").trim() || null;
    const costRaw = String(formData.get("costCents") ?? "").trim();
    const cost_cents = costRaw ? Math.max(0, Math.round(Number(costRaw))) : null;
    const supplierId = String(formData.get("supplierId") ?? "").trim() || null;
    const handling_days = Math.max(0, Number(formData.get("handlingDays") ?? 0) || 0);
    const status = String(formData.get("status") ?? "published") as ProductStatus;
    const sellable = formData.get("sellable") === "on";

    const db = getAdminDb();
    const { data, error } = await db
      .from("products")
      .update({
        sku,
        ean,
        cost_cents,
        supplier_id: supplierId,
        handling_days,
        status,
        sellable,
      } as never)
      .eq("id", productId)
      .select("slug")
      .maybeSingle<{ slug: string }>();
    if (error) return;

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePublicCatalog(data?.slug ?? null);
  } catch {
    // Auth failures redirect; overige fouten blijven stil (form post).
  }
}

export async function upsertSupplierAction(formData: FormData): Promise<void> {
  try {
    await assertCatalogAccess();
    const id = String(formData.get("id") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const contact_email = String(formData.get("contactEmail") ?? "").trim() || null;
    const website_url = String(formData.get("websiteUrl") ?? "").trim() || null;
    if (!name) return;

    const slug = slugify(name);
    const db = getAdminDb();

    if (id) {
      const { error } = await db
        .from("suppliers")
        .update({ name, slug, contact_email, website_url } as never)
        .eq("id", id);
      if (error) return;
    } else {
      const { error } = await db
        .from("suppliers")
        .insert({ name, slug, contact_email, website_url } as never);
      if (error) return;
    }

    revalidatePath("/admin/suppliers");
  } catch {
    // Auth failures redirect.
  }
}

export async function reviewChangeRequestAction(formData: FormData): Promise<void> {
  try {
    const userId = await assertReviewAccess();
    const id = String(formData.get("id") ?? "");
    const decision = String(formData.get("decision") ?? "") as "approved" | "rejected";
    const review_notes = String(formData.get("reviewNotes") ?? "").trim() || null;
    if (!id || (decision !== "approved" && decision !== "rejected")) return;

    const db = getAdminDb();
    const { error } = await db
      .from("change_requests")
      .update({
        status: decision as ChangeRequestStatus,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        review_notes,
      } as never)
      .eq("id", id)
      .eq("status", "pending");
    if (error) return;

    revalidatePath("/admin/changes");
  } catch {
    // Auth failures redirect.
  }
}

export async function updateOrderNotesAction(formData: FormData): Promise<void> {
  try {
    await assertOrderAccess();
    const orderId = String(formData.get("orderId") ?? "");
    const notes = String(formData.get("notes") ?? "").trim() || null;
    if (!orderId) return;

    const db = getAdminDb();
    const { error } = await db
      .from("orders")
      .update({ notes } as never)
      .eq("id", orderId);
    if (error) return;

    revalidatePath(`/admin/orders/${orderId}`);
  } catch {
    // Auth failures redirect.
  }
}

export async function approveApprovalAction(formData: FormData): Promise<void> {
  try {
    const userId = await assertOrderAccess();
    const actionId = String(formData.get("actionId") ?? "");
    const orderId = String(formData.get("orderId") ?? "");
    if (!actionId || !orderId) return;

    await approveAndSendAction(actionId, userId);
    revalidatePath(`/admin/orders/${orderId}`);
  } catch {
    // Auth failures redirect.
  }
}

export async function markShippedAction(formData: FormData): Promise<void> {
  try {
    const userId = await assertOrderAccess();
    const shipmentId = String(formData.get("shipmentId") ?? "");
    const orderId = String(formData.get("orderId") ?? "");
    const carrier = String(formData.get("carrier") ?? "").trim();
    const trackingCode = String(formData.get("trackingCode") ?? "").trim();
    const trackingUrl = String(formData.get("trackingUrl") ?? "").trim() || null;
    if (!shipmentId || !orderId || !carrier || !trackingCode) return;

    await markShipmentShipped({
      shipmentId,
      orderId,
      carrier,
      trackingCode,
      trackingUrl,
      approvedBy: userId,
    });
    revalidatePath(`/admin/orders/${orderId}`);
  } catch {
    // Auth failures redirect.
  }
}

export async function updateOfferAffiliateAction(formData: FormData): Promise<void> {
  try {
    await assertCatalogAccess();
    const offerId = String(formData.get("offerId") ?? "");
    const productId = String(formData.get("productId") ?? "");
    if (!offerId) return;

    const affiliate_deeplink = String(formData.get("affiliateDeeplink") ?? "").trim() || null;
    const affiliate_url = String(formData.get("affiliateUrl") ?? "").trim() || null;
    const affiliate_network = String(formData.get("affiliateNetwork") ?? "").trim() || null;
    const commission_type = String(formData.get("commissionType") ?? "").trim() as CommissionType;
    const rateRaw = String(formData.get("commissionRate") ?? "").trim();
    const commission_rate = rateRaw ? Number(rateRaw) : null;
    const fixedRaw = String(formData.get("commissionCentsFixed") ?? "").trim();
    const commission_cents_fixed = fixedRaw ? Math.round(Number(fixedRaw)) : null;
    const commission_source_url = String(formData.get("commissionSourceUrl") ?? "").trim() || null;

    const db = getAdminDb();
    const { error } = await db
      .from("offers")
      .update({
        affiliate_deeplink,
        affiliate_url,
        affiliate_network,
        commission_type: commission_type || null,
        commission_rate,
        commission_cents_fixed,
        commission_source_url,
        last_commission_verified_at: commission_source_url ? new Date().toISOString() : null,
      } as never)
      .eq("id", offerId);
    if (error) return;

    let productSlug: string | null = null;
    if (productId) {
      const { data: product } = await db
        .from("products")
        .select("slug")
        .eq("id", productId)
        .maybeSingle<{ slug: string }>();
      productSlug = product?.slug ?? null;
    }

    revalidatePath(`/admin/products/${productId}`);
    revalidatePublicCatalog(productSlug);
  } catch {
    // Auth failures redirect.
  }
}

export async function updateLeadStatusAction(formData: FormData): Promise<void> {
  try {
    const userId = await assertReviewAccess();
    const leadId = String(formData.get("leadId") ?? "");
    const status = String(formData.get("status") ?? "") as
      "approved" | "sent" | "converted" | "rejected";
    const notes = String(formData.get("notes") ?? "").trim() || null;
    if (!leadId || !status) return;

    const db = getAdminDb();
    const patch: Record<string, unknown> = { status, notes };
    if (status === "approved") {
      patch.approved_by = userId;
      patch.approved_at = new Date().toISOString();
    }
    if (status === "sent") {
      patch.sent_at = new Date().toISOString();
    }

    const { error } = await db
      .from("leads")
      .update(patch as never)
      .eq("id", leadId);
    if (error) return;

    revalidatePath("/admin/leads");
  } catch {
    // Auth failures redirect.
  }
}
