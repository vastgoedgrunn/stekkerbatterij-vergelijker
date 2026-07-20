import type { Json } from "@/lib/db/database.types";
import { isBolPartnerClickUrl } from "@/lib/affiliate/bol";
import { isAwinClickUrl } from "@/lib/affiliate/awin";

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
  let url: URL;
  try {
    url = new URL(substituted);
  } catch {
    throw new Error("Ongeldige affiliate-bestemming: geen geldige URL.");
  }
  if (url.protocol !== "https:") {
    throw new Error(
      `Affiliate-bestemming moet https gebruiken (kreeg ${url.protocol || "geen protocol"}).`,
    );
  }
  // Bol partner-click: query-string met rust laten (s + url zijn commissie-kritisch).
  if (isBolPartnerClickUrl(substituted)) {
    return url.toString();
  }
  // Awin cread: alleen clickref zetten, awinmid/awinaffid/ued niet aanpassen.
  if (isAwinClickUrl(substituted)) {
    url.searchParams.set("clickref", clickRef);
    return url.toString();
  }
  applyParams(url, params, clickRef);
  return url.toString();
}
