import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { serverEnv } from "@/lib/env/server";
import { logger } from "@/lib/observability/logger";
import type { OfferClickRow } from "@/lib/db/database.types";

export const dynamic = "force-dynamic";

const DEFAULT_UTM: Record<string, string> = {
  utm_source: "stekkerbatterijvergelijker",
  utm_medium: "affiliate",
};

interface OfferDestination {
  id: string;
  product_id: string;
  merchant_id: string;
  affiliate_url: string | null;
  affiliate_params: Record<string, unknown> | null;
  products: { slug: string } | null;
  merchants: { website_url: string | null } | null;
}

/** Voegt affiliate-/UTM-parameters toe aan een bestemmings-URL. */
function withAffiliateParams(destination: string, params: Record<string, unknown> | null): string {
  const url = new URL(destination);
  for (const [key, value] of Object.entries(DEFAULT_UTM)) {
    url.searchParams.set(key, value);
  }
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * Uitgaande affiliate-redirect: /api/go/{offerId}
 * Zoekt de offer op via de service-role client, bepaalt de bestemming
 * (affiliate_url ?? merchant.website_url), plakt tracking-parameters erop,
 * logt de klik (best-effort) en stuurt door met een 302. Faalt nooit hard:
 * bij ontbrekende configuratie of data valt hij terug op een veilige pagina.
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
      "id, product_id, merchant_id, affiliate_url, affiliate_params, products(slug), merchants(website_url)",
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

  const fallback = offer.products?.slug
    ? new URL(`/batterijen/${offer.products.slug}`, request.nextUrl.origin)
    : homepage;

  const rawDestination = offer.affiliate_url ?? offer.merchants?.website_url ?? null;
  if (!rawDestination) {
    return NextResponse.redirect(fallback, 302);
  }

  let destination: string;
  try {
    destination = withAffiliateParams(rawDestination, offer.affiliate_params);
  } catch {
    return NextResponse.redirect(fallback, 302);
  }

  // Klik loggen — best-effort, mag de redirect nooit blokkeren.
  try {
    const payload = {
      offer_id: offer.id,
      product_id: offer.product_id,
      merchant_id: offer.merchant_id,
      referrer: request.headers.get("referer"),
      user_agent: request.headers.get("user-agent"),
    } satisfies Partial<OfferClickRow>;

    // supabase-js leidt het Insert-type hier te strikt af; de payload is via
    // `satisfies Partial<OfferClickRow>` volledig type-gecontroleerd.
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
