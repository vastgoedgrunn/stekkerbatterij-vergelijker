import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { serverEnv } from "@/lib/env/server";
import { logger } from "@/lib/observability/logger";
import { buildAffiliateDestination } from "@/lib/affiliate/build-destination";
import type { Json } from "@/lib/db/database.types";

export const dynamic = "force-dynamic";

interface EnergyPartnerRow {
  id: string;
  slug: string;
  affiliate_url: string;
  affiliate_params: Json | null;
}

/** Energie-affiliate redirect: /api/go/energy/{slug} */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;
  const energiePage = new URL("/energie", request.nextUrl.origin);

  if (!isSupabaseConfigured() || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.redirect(energiePage, 302);
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("energy_partners")
    .select("id, slug, affiliate_url, affiliate_params")
    .eq("slug", slug)
    .eq("active", true)
    .limit(1)
    .returns<EnergyPartnerRow[]>();

  const partner = data?.[0];
  if (error || !partner) {
    if (error) logger.warn("Energiepartner niet gevonden", { slug, message: error.message });
    return NextResponse.redirect(energiePage, 302);
  }

  const clickRef = crypto.randomUUID();
  let destination: string;
  try {
    destination = buildAffiliateDestination(partner.affiliate_url, partner.affiliate_params, clickRef);
  } catch {
    return NextResponse.redirect(energiePage, 302);
  }

  try {
    const { error: insertError } = await supabase.from("energy_clicks").insert({
      energy_partner_id: partner.id,
      click_ref: clickRef,
      referrer: request.headers.get("referer"),
      user_agent: request.headers.get("user-agent"),
    } as never);
    if (insertError) {
      logger.warn("Kon energie-klik niet loggen", { slug, message: insertError.message });
    }
  } catch {
    // best-effort
  }

  return NextResponse.redirect(destination, 302);
}
