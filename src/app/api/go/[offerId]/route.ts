import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHash } from "crypto";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { serverEnv } from "@/lib/env/server";
import { logger } from "@/lib/observability/logger";
import { buildAffiliateDestination } from "@/lib/affiliate/build-destination";
import { ensureBolPartnerDeeplink } from "@/lib/affiliate/bol";
import { isEligibleOutboundOffer } from "@/features/offers-pricing/offer-eligibility";
import type { Json } from "@/lib/db/database.types";

export const dynamic = "force-dynamic";

interface OfferDestination {
  id: string;
  product_id: string;
  merchant_id: string;
  affiliate_url: string | null;
  affiliate_deeplink: string | null;
  affiliate_link_status: "ok" | "pending" | "broken" | null;
  deleted_at: string | null;
  affiliate_params: Json | null;
  products: { slug: string; status: string } | null;
  merchants: { website_url: string | null } | null;
}

function sessionHash(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip");
  const ua = request.headers.get("user-agent") ?? "";
  if (!ip) return null;
  return createHash("sha256").update(`${ip}:${ua}`).digest("hex").slice(0, 32);
}

/**
 * Uitgaande affiliate-redirect: /api/go/{offerId}
 * Logt klik met click_ref, bouwt deeplink met netwerk-params en stuurt 302 door.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ offerId: string }> },
): Promise<NextResponse> {
  const { offerId } = await params;
  const homepage = new URL("/", request.nextUrl.origin);

  if (!isSupabaseConfigured() || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.redirect(homepage, 302);
  }

  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("offers")
    .select(
      "id, product_id, merchant_id, affiliate_url, affiliate_deeplink, affiliate_link_status, deleted_at, affiliate_params, products(slug, status), merchants(website_url)",
    )
    .eq("id", offerId)
    .is("deleted_at", null)
    .limit(1)
    .returns<OfferDestination[]>();

  const offer = data?.[0];

  if (error || !offer) {
    if (error)
      logger.warn("Kon offer voor redirect niet laden", { message: error.message, offerId });
    return NextResponse.redirect(homepage, 302);
  }

  if (offer.products?.status !== "published") {
    return NextResponse.redirect(homepage, 302);
  }

  const fallback = offer.products?.slug
    ? new URL(`/batterijen/${offer.products.slug}`, request.nextUrl.origin)
    : homepage;

  // Nooit doorsturen bij broken/SKU-mismatch; liever terug naar PDP.
  if (!isEligibleOutboundOffer(offer)) {
    logger.warn("Outbound geweigerd: offer niet eligible", {
      offerId,
      status: offer.affiliate_link_status,
    });
    return NextResponse.redirect(fallback, 302);
  }

  const rawDestination = offer.affiliate_deeplink ?? offer.affiliate_url;
  if (!rawDestination) {
    return NextResponse.redirect(fallback, 302);
  }

  // Bol product-URL's zonder partner-deeplink: wrap met site-ID (BOL_PUBLISHER_ID).
  const bolReady = ensureBolPartnerDeeplink(rawDestination, serverEnv.BOL_PUBLISHER_ID);

  const clickRef = crypto.randomUUID();
  let destination: string;
  try {
    destination = buildAffiliateDestination(bolReady, offer.affiliate_params, clickRef);
  } catch {
    return NextResponse.redirect(fallback, 302);
  }

  try {
    const payload = {
      offer_id: offer.id,
      product_id: offer.product_id,
      merchant_id: offer.merchant_id,
      referrer: request.headers.get("referer"),
      user_agent: request.headers.get("user-agent"),
      session_hash: sessionHash(request),
      click_ref: clickRef,
    };

    const { error: insertError } = await supabase.from("offer_clicks").insert(payload as never);
    if (insertError) {
      logger.warn("Kon klik niet loggen", { offerId, message: insertError.message });
    }
  } catch (logError) {
    logger.warn("Kon klik niet loggen", {
      offerId,
      message: logError instanceof Error ? logError.message : "onbekend",
    });
  }

  return NextResponse.redirect(destination, 302);
}
