import "server-only";
import { isFeatureEnabled } from "@/config/feature-flags";
import { supplierOrderEmail } from "@/lib/email/templates";
import { logger } from "@/lib/observability/logger";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { serverEnv } from "@/lib/env/server";
import type { AddressRow } from "@/lib/db/database.types";

interface OrderLineWithProduct {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  product_id: string | null;
  products: {
    supplier_id: string | null;
    suppliers: { id: string; name: string; contact_email: string | null } | null;
  } | null;
}

interface OrderWithLines {
  id: string;
  order_number: number;
  email: string;
  shipping_address_id: string | null;
  order_lines: OrderLineWithProduct[];
}

/**
 * Na succesvolle betaling: shipment-records aanmaken en (indien leverancier +
 * contact-e-mail) een dropship-ordermail in de goedkeuringswachtrij zetten.
 * Geen auto-verzending, admin keurt goed in /admin/orders/[id].
 */
export async function queueFulfillmentOnPaidOrder(orderId: string): Promise<void> {
  if (!isFeatureEnabled("shipping")) return;
  if (!isSupabaseConfigured() || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) return;

  try {
    const db = createSupabaseServiceClient();
    const { data: order, error } = await db
      .from("orders")
      .select(
        "id, order_number, email, shipping_address_id, order_lines(id, name, sku, quantity, product_id, products(supplier_id, suppliers(id, name, contact_email)))",
      )
      .eq("id", orderId)
      .maybeSingle<OrderWithLines>();

    if (error || !order) {
      logger.warn("Kon order niet laden voor fulfilment", { orderId, message: error?.message });
      return;
    }

    const supplierMap = new Map<
      string,
      {
        supplier: { id: string; name: string; contact_email: string | null };
        lines: OrderLineWithProduct[];
      }
    >();

    for (const line of order.order_lines) {
      const supplier = line.products?.suppliers;
      if (!supplier?.id) continue;
      const existing = supplierMap.get(supplier.id);
      if (existing) existing.lines.push(line);
      else supplierMap.set(supplier.id, { supplier, lines: [line] });
    }

    for (const { supplier, lines } of supplierMap.values()) {
      const { data: existingShipment } = await db
        .from("shipments")
        .select("id")
        .eq("order_id", orderId)
        .eq("supplier_id", supplier.id)
        .maybeSingle<{ id: string }>();

      let shipmentId = existingShipment?.id;
      if (!shipmentId) {
        const { data: shipment, error: shipError } = await db
          .from("shipments")
          .insert({ order_id: orderId, supplier_id: supplier.id, status: "pending" } as never)
          .select("id")
          .single<{ id: string }>();
        if (shipError || !shipment) {
          logger.warn("Kon shipment niet aanmaken", { orderId, message: shipError?.message });
          continue;
        }
        shipmentId = shipment.id;
      }

      if (!supplier.contact_email) continue;

      const { count } = await db
        .from("approval_actions")
        .select("*", { count: "exact", head: true })
        .eq("order_id", orderId)
        .eq("shipment_id", shipmentId)
        .eq("kind", "supplier_order_email")
        .in("status", ["pending", "approved", "sent"]);

      if ((count ?? 0) > 0) continue;

      let addressData: Pick<
        AddressRow,
        "full_name" | "line1" | "line2" | "postal_code" | "city" | "country" | "phone"
      > | null = null;

      if (order.shipping_address_id) {
        const { data: addr } = await db
          .from("addresses")
          .select("full_name, line1, line2, postal_code, city, country, phone")
          .eq("id", order.shipping_address_id)
          .maybeSingle<
            Pick<
              AddressRow,
              "full_name" | "line1" | "line2" | "postal_code" | "city" | "country" | "phone"
            >
          >();
        if (addr) addressData = addr;
      }

      const message = supplierOrderEmail({
        orderNumber: order.order_number,
        supplierName: supplier.name,
        recipientEmail: supplier.contact_email,
        lines: lines.map((l) => ({ name: l.name, sku: l.sku, quantity: l.quantity })),
        shippingAddress: addressData
          ? {
              fullName: addressData.full_name,
              line1: addressData.line1,
              line2: addressData.line2,
              postalCode: addressData.postal_code,
              city: addressData.city,
              country: addressData.country,
              phone: addressData.phone,
            }
          : null,
      });

      await db.from("approval_actions").insert({
        kind: "supplier_order_email",
        status: "pending",
        order_id: orderId,
        shipment_id: shipmentId,
        summary: `Dropship-order naar ${supplier.name} voor #${order.order_number}`,
        recipient_email: supplier.contact_email,
        email_subject: message.subject,
        email_body_html: message.html,
        email_body_text: message.text,
        payload: { supplier_id: supplier.id, supplier_name: supplier.name },
      } as never);
    }
  } catch (error) {
    logger.warn("Fulfilment-queue mislukt", {
      orderId,
      message: error instanceof Error ? error.message : "onbekend",
    });
  }
}
