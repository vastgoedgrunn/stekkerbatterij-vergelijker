import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { serverEnv } from "@/lib/env/server";
import { buildAffiliateDestination } from "@/lib/affiliate/build-destination";

export const dynamic = "force-dynamic";

const DEFAULT_EWNDR_URL = "https://e-wndr.nl/";
const EWNDR_PARAMS = { subid: "{click_ref}" } as const;

/** Thuisbatterij-lead affiliate redirect: /api/go/lead/e-wndr */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  const fallback = new URL("/beslishulp", _request.nextUrl.origin);
  const rawDestination = serverEnv.EWNDR_LEAD_AFFILIATE_URL ?? DEFAULT_EWNDR_URL;

  const clickRef = crypto.randomUUID();
  try {
    const destination = buildAffiliateDestination(rawDestination, EWNDR_PARAMS, clickRef);
    return NextResponse.redirect(destination, 302);
  } catch {
    return NextResponse.redirect(fallback, 302);
  }
}
