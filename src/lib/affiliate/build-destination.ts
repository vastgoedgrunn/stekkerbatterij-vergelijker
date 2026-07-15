import type { Json } from "@/lib/db/database.types";

const DEFAULT_UTM: Record<string, string> = {
  utm_source: "stekkerbatterijvergelijker",
  utm_medium: "affiliate",
};

/** Vervangt `{click_ref}` placeholders in params/URL. */
function substituteClickRef(value: string, clickRef: string): string {
  return value.replace(/\{click_ref\}/g, clickRef);
}

function applyParams(url: URL, params: Record<string, unknown> | null, clickRef: string): void {
  for (const [key, value] of Object.entries(DEFAULT_UTM)) {
    url.searchParams.set(key, value);
  }
  if (params) {
    for (const [key, raw] of Object.entries(params)) {
      if (typeof raw === "string") {
        url.searchParams.set(key, substituteClickRef(raw, clickRef));
      } else if (typeof raw === "number" || typeof raw === "boolean") {
        url.searchParams.set(key, String(raw));
      }
    }
  }
  url.searchParams.set("click_ref", clickRef);
}

/**
 * Bouwt de outbound affiliate-URL met UTM, netwerk-params en click_ref.
 */
export function buildAffiliateDestination(
  rawDestination: string,
  affiliateParams: Json | null,
  clickRef: string,
): string {
  const params =
    affiliateParams !== null &&
    typeof affiliateParams === "object" &&
    !Array.isArray(affiliateParams)
      ? (affiliateParams as Record<string, unknown>)
      : null;

  const substituted = substituteClickRef(rawDestination, clickRef);
  const url = new URL(substituted);
  applyParams(url, params, clickRef);
  return url.toString();
}
