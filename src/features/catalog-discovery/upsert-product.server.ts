import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { serverEnv } from "@/lib/env/server";
import { buildBolPartnerDeeplink } from "./bol-client";
import { extractBolProductId } from "./match-sku";
import { slugifyProductName } from "./slug";
import { resolveAndIngestProductImage } from "./ingest-image.server";
import { verifyOutboundForProduct } from "./verify-outbound";
import type { DiscoveredCandidate } from "./types";

function getDb() {
  if (!isSupabaseConfigured() || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service role vereist voor catalog discovery upsert.");
  }
  return createSupabaseServiceClient();
}

export type UpsertResult = {
  productId: string;
  offerId: string | null;
  slug: string;
  created: boolean;
  outboundStatus: "ok" | "pending" | "broken";
  outboundNote: string;
};

function buildSummary(candidate: DiscoveredCandidate): string {
  const bits = [candidate.rawTitle];
  if (candidate.capacityKwh != null) bits.push(`${candidate.capacityKwh} kWh`);
  if (candidate.powerKw != null) bits.push(`${candidate.powerKw} kW`);
  return `${bits.join(", ")}. Plug-and-play stekkerbatterij voor in huis.`;
}

function buildDescription(candidate: DiscoveredCandidate): string {
  if (candidate.rawDescription && candidate.rawDescription.trim().length > 40) {
    return candidate.rawDescription.trim();
  }
  return [
    `${candidate.rawTitle} is een plug-and-play oplossing om zonnestroom op te slaan en later te gebruiken.`,
    "Vergelijk capaciteit, vermogen, garantie en actuele aanbieders op Stekkerbatterij Vergelijker.",
    candidate.url ? `Bronpagina: ${candidate.url}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Maak of update draft product + offer vanuit een discovery-candidate.
 * Outbound krijgt alleen status ok na verifyOutboundForProduct.
 */
export async function upsertProductFromCandidate(
  candidate: DiscoveredCandidate,
): Promise<UpsertResult> {
  const db = getDb();

  if (!candidate.brandSlug) {
    throw new Error(`Geen brand_slug voor "${candidate.rawTitle}"`);
  }

  const { data: brand, error: brandError } = await db
    .from("brands")
    .select("id, slug")
    .eq("slug", candidate.brandSlug)
    .is("deleted_at", null)
    .maybeSingle<{ id: string; slug: string }>();

  if (brandError || !brand) {
    throw new Error(`Merk niet gevonden: ${candidate.brandSlug}`);
  }

  const slug = slugifyProductName(candidate.rawTitle);
  const { data: existing } = await db
    .from("products")
    .select("id, slug, name, status, image_path")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle<{
      id: string;
      slug: string;
      name: string;
      status: string;
      image_path: string | null;
    }>();

  const imageResolved = await resolveAndIngestProductImage({
    slug,
    productPageUrl: candidate.url,
    candidateImageUrl: candidate.imageUrl,
    existingImagePath: existing?.image_path ?? null,
  });
  const imagePath = imageResolved.imagePath;

  let productId: string;
  let created = false;

  if (existing) {
    productId = existing.id;
    await db
      .from("products")
      .update({
        summary: buildSummary(candidate),
        description: buildDescription(candidate),
        capacity_kwh: candidate.capacityKwh ?? null,
        power_kw: candidate.powerKw ?? null,
        image_path: imagePath,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", productId);
  } else {
    const { data: inserted, error: insertError } = await db
      .from("products")
      .insert({
        brand_id: brand.id,
        name: candidate.rawTitle,
        slug,
        summary: buildSummary(candidate),
        description: buildDescription(candidate),
        status: "draft",
        capacity_kwh: candidate.capacityKwh ?? null,
        power_kw: candidate.powerKw ?? null,
        expandable: true,
        image_path: imagePath,
      } as never)
      .select("id, slug")
      .single<{ id: string; slug: string }>();

    if (insertError || !inserted) {
      throw new Error(insertError?.message ?? "Product insert mislukt");
    }
    productId = inserted.id;
    created = true;
  }

  const verify = await verifyOutboundForProduct({
    url: candidate.url,
    productName: candidate.rawTitle,
    fetchPage: true,
  });

  const { data: bolMerchant } = await db
    .from("merchants")
    .select("id, slug")
    .eq("slug", "bol")
    .is("deleted_at", null)
    .maybeSingle<{ id: string; slug: string }>();

  let offerId: string | null = null;
  const isBol = Boolean(extractBolProductId(candidate.url));
  const merchantId = isBol ? bolMerchant?.id : null;

  if (merchantId && candidate.priceCents != null && candidate.priceCents > 0) {
    const deeplink = isBol ? buildBolPartnerDeeplink(candidate.url) : null;
    const { data: offer, error: offerError } = await db
      .from("offers")
      .upsert(
        {
          product_id: productId,
          merchant_id: merchantId,
          price_cents: candidate.priceCents,
          stock_status: "in_stock",
          affiliate_url: candidate.url,
          affiliate_deeplink: deeplink,
          affiliate_network: isBol ? "bol-partner" : null,
          affiliate_link_status: verify.status,
          affiliate_link_note: verify.note,
          affiliate_link_checked_at: new Date().toISOString(),
          last_checked_at: new Date().toISOString(),
          deleted_at: null,
        } as never,
        { onConflict: "product_id,merchant_id" },
      )
      .select("id")
      .maybeSingle<{ id: string }>();

    if (!offerError && offer) {
      offerId = offer.id;
    }
  } else if (merchantId && verify.ok) {
    // Geen prijs: toch offer met pending/ok URL voor latere prijs-fill.
    const deeplink = isBol ? buildBolPartnerDeeplink(candidate.url) : null;
    const { data: offer } = await db
      .from("offers")
      .upsert(
        {
          product_id: productId,
          merchant_id: merchantId,
          price_cents: candidate.priceCents ?? 0,
          stock_status: "unknown",
          affiliate_url: candidate.url,
          affiliate_deeplink: deeplink,
          affiliate_network: isBol ? "bol-partner" : null,
          affiliate_link_status: verify.status === "ok" ? "pending" : verify.status,
          affiliate_link_note:
            verify.status === "ok" ? `${verify.note}; prijs nog invullen` : verify.note,
          affiliate_link_checked_at: new Date().toISOString(),
          last_checked_at: new Date().toISOString(),
          deleted_at: null,
        } as never,
        { onConflict: "product_id,merchant_id" },
      )
      .select("id")
      .maybeSingle<{ id: string }>();
    offerId = offer?.id ?? null;
  }

  return {
    productId,
    offerId,
    slug,
    created,
    outboundStatus: verify.status,
    outboundNote: verify.note,
  };
}
