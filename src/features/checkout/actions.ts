"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getMollieClient, isMollieConfigured, toMollieAmountValue } from "@/lib/payments/mollie";
import { featureFlags } from "@/config/feature-flags";
import { businessRules } from "@/config/business-rules";
import { clientEnv } from "@/lib/env/client";
import { logger } from "@/lib/observability/logger";
import { breakdownFromGross } from "./vat";
import type { AddressRow, OrderLineRow, OrderRow, PaymentRow } from "@/lib/db/database.types";

const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Vul je naam in.").max(120),
  email: z.string().trim().email("Vul een geldig e-mailadres in."),
  company: z.string().trim().max(120).optional(),
  line1: z.string().trim().min(2, "Vul je straat en huisnummer in.").max(160),
  line2: z.string().trim().max(160).optional(),
  postalCode: z.string().trim().min(4, "Vul je postcode in.").max(12),
  city: z.string().trim().min(2, "Vul je woonplaats in.").max(120),
  country: z
    .string()
    .trim()
    .length(2)
    .transform((c) => c.toUpperCase())
    .default("NL"),
  phone: z.string().trim().max(40).optional(),
});

const cartLineSchema = z.object({
  offerId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(20),
});

export interface CheckoutState {
  status: "idle" | "error";
  message?: string;
  redirectUrl?: string;
}

interface SellableOffer {
  id: string;
  price_cents: number;
  products: {
    id: string;
    name: string;
    sku: string | null;
    supplier_id: string | null;
  } | null;
  merchants: { is_self: boolean } | null;
}

/**
 * Maakt een order + Mollie-betaling aan en geeft de Mollie-checkout-URL terug.
 * Volledig achter `featureFlags.checkout`. Prijzen worden server-side opnieuw
 * uit de database gelezen (nooit vertrouwen op client-bedragen). Alleen eigen
 * (self) aanbiedingen van producten met een leverancier zijn verkoopbaar.
 * Schrijven gebeurt via de service-role client; RLS blijft deny-by-default.
 */
export async function createCheckout(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  if (!featureFlags.checkout) {
    return { status: "error", message: "De webshop is nog niet actief." };
  }
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "Bestellen is tijdelijk niet beschikbaar." };
  }
  if (!isMollieConfigured()) {
    return { status: "error", message: "Betalen is tijdelijk niet beschikbaar." };
  }

  const parsedAddress = addressSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    company: formData.get("company") || undefined,
    line1: formData.get("line1"),
    line2: formData.get("line2") || undefined,
    postalCode: formData.get("postalCode"),
    city: formData.get("city"),
    country: formData.get("country") || "NL",
    phone: formData.get("phone") || undefined,
  });
  if (!parsedAddress.success) {
    return {
      status: "error",
      message: parsedAddress.error.issues[0]?.message ?? "Ongeldig adres.",
    };
  }

  let cartRaw: unknown;
  try {
    cartRaw = JSON.parse(String(formData.get("cart") ?? "[]"));
  } catch {
    return { status: "error", message: "Je winkelmand kon niet gelezen worden." };
  }
  const parsedCart = z.array(cartLineSchema).min(1).safeParse(cartRaw);
  if (!parsedCart.success) {
    return { status: "error", message: "Je winkelmand is leeg of ongeldig." };
  }

  const address = parsedAddress.data;
  // Dubbele offer-id's samenvoegen zodat we per aanbieding één regel maken.
  const quantityByOffer = new Map<string, number>();
  for (const line of parsedCart.data) {
    quantityByOffer.set(line.offerId, (quantityByOffer.get(line.offerId) ?? 0) + line.quantity);
  }

  const service = createSupabaseServiceClient();

  const { data: offerRows, error: offerError } = await service
    .from("offers")
    .select("id, price_cents, products(id, name, sku, supplier_id), merchants(is_self)")
    .in("id", [...quantityByOffer.keys()])
    .is("deleted_at", null)
    .returns<SellableOffer[]>();

  if (offerError) {
    logger.warn("Kon aanbiedingen voor checkout niet laden", { message: offerError.message });
    return { status: "error", message: "Bestellen is tijdelijk niet beschikbaar." };
  }

  const vatRate = businessRules.vatRate;
  const lines = (offerRows ?? [])
    .filter((o) => o.merchants?.is_self === true && o.products?.supplier_id != null)
    .map((o) => {
      const quantity = quantityByOffer.get(o.id) ?? 0;
      const lineTotal = o.price_cents * quantity;
      const perLine = breakdownFromGross(lineTotal, vatRate);
      return {
        offerId: o.id,
        productId: o.products!.id,
        name: o.products!.name,
        sku: o.products!.sku,
        quantity,
        unitPriceCents: o.price_cents,
        lineTotalCents: lineTotal,
        subtotalCents: perLine.subtotalCents,
        vatCents: perLine.vatCents,
      };
    })
    .filter((l) => l.quantity > 0);

  if (lines.length === 0) {
    return { status: "error", message: "Geen van de producten in je mand is bij ons te koop." };
  }

  const totals = breakdownFromGross(
    lines.reduce((sum, l) => sum + l.lineTotalCents, 0),
    vatRate,
  );

  // Ingelogde gebruiker koppelen (optioneel, gast-checkout is toegestaan).
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  const userId = user?.id ?? null;

  const addressPayload = {
    user_id: userId,
    full_name: address.fullName,
    company: address.company ?? null,
    line1: address.line1,
    line2: address.line2 ?? null,
    postal_code: address.postalCode,
    city: address.city,
    country: address.country,
    phone: address.phone ?? null,
  } satisfies Partial<AddressRow>;

  const { data: addressRow, error: addressError } = await service
    .from("addresses")
    .insert(addressPayload as never)
    .select("id")
    .single<{ id: string }>();

  if (addressError || !addressRow) {
    logger.warn("Kon adres niet opslaan", { message: addressError?.message });
    return { status: "error", message: "Kon je bestelling niet aanmaken." };
  }

  const orderPayload = {
    user_id: userId,
    email: address.email,
    status: "pending" as const,
    currency: businessRules.currency,
    vat_rate: vatRate,
    subtotal_cents: totals.subtotalCents,
    vat_cents: totals.vatCents,
    total_cents: totals.totalCents,
    shipping_address_id: addressRow.id,
    billing_address_id: addressRow.id,
  } satisfies Partial<OrderRow>;

  const { data: orderRow, error: orderError } = await service
    .from("orders")
    .insert(orderPayload as never)
    .select("id, order_number")
    .single<{ id: string; order_number: number }>();

  if (orderError || !orderRow) {
    logger.warn("Kon order niet aanmaken", { message: orderError?.message });
    return { status: "error", message: "Kon je bestelling niet aanmaken." };
  }

  const linePayloads = lines.map(
    (l) =>
      ({
        order_id: orderRow.id,
        product_id: l.productId,
        offer_id: l.offerId,
        sku: l.sku,
        name: l.name,
        quantity: l.quantity,
        unit_price_cents: l.unitPriceCents,
        vat_rate: vatRate,
        line_total_cents: l.lineTotalCents,
      }) satisfies Partial<OrderLineRow>,
  );

  const { error: linesError } = await service.from("order_lines").insert(linePayloads as never);
  if (linesError) {
    logger.warn("Kon orderregels niet opslaan", { message: linesError.message });
    return { status: "error", message: "Kon je bestelling niet aanmaken." };
  }

  const baseUrl = clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  let checkoutUrl: string | null = null;
  let providerPaymentId: string | null = null;
  try {
    const molliePayment = await getMollieClient().payments.create({
      amount: { currency: businessRules.currency, value: toMollieAmountValue(totals.totalCents) },
      description: `Bestelling ${orderRow.order_number} van Stekkerbatterij Vergelijker`,
      redirectUrl: `${baseUrl}/bestelling/${orderRow.id}`,
      webhookUrl: `${baseUrl}/api/webhooks/mollie`,
      metadata: { order_id: orderRow.id },
    });
    checkoutUrl = molliePayment.getCheckoutUrl();
    providerPaymentId = molliePayment.id;
  } catch (error) {
    logger.error("Mollie-betaling aanmaken mislukt", {
      message: error instanceof Error ? error.message : "onbekend",
    });
    return { status: "error", message: "Kon de betaling niet starten. Probeer het opnieuw." };
  }

  const paymentPayload = {
    order_id: orderRow.id,
    provider: "mollie",
    provider_payment_id: providerPaymentId,
    status: "open" as const,
    amount_cents: totals.totalCents,
    currency: businessRules.currency,
    checkout_url: checkoutUrl,
  } satisfies Partial<PaymentRow>;

  const { error: paymentError } = await service.from("payments").insert(paymentPayload as never);
  if (paymentError) {
    logger.warn("Kon betaling niet opslaan", { message: paymentError.message });
    // De Mollie-betaling bestaat wel; de webhook koppelt op order_id via metadata.
  }

  if (!checkoutUrl) {
    return { status: "error", message: "Kon de betaalpagina niet openen." };
  }

  return { status: "idle", redirectUrl: checkoutUrl };
}
