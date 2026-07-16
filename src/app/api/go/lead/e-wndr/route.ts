import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { serverEnv } from "@/lib/env/server";
import { buildAffiliateDestination } from "@/lib/affiliate/build-destination";

export const dynamic = "force-dynamic";

const DEFAULT_EWNDR_URL = "https://e-wndr.nl/";
const EWNDR_PARAMS = { subid: "{click_ref}" } as const;

/**
 * Thuisbatterij-lead affiliate redirect: /api/go/lead/e-wndr?product=slug
 * Stuurt door naar e-WNDR quote-URL met click_ref/subid tracking.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const fallback = new URL("/beslishulp", request.nextUrl.origin);
  const rawDestination = serverEnv.EWNDR_LEAD_AFFILIATE_URL ?? DEFAULT_EWNDR_URL;
  const productSlug = request.nextUrl.searchParams.get("product")?.trim() || null;

  const clickRef = crypto.randomUUID();
  try {
    let destination = buildAffiliateDestination(rawDestination, EWNDR_PARAMS, clickRef);
    if (productSlug) {
      const url = new URL(destination);
      url.searchParams.set("product", productSlug);
      url.searchParams.set("utm_content", productSlug);
      destination = url.toString();
    }
    return NextResponse.redirect(destination, 302);
  } catch {
    return NextResponse.redirect(fallback, 302);
  }
}
