/**
 * Welke offers mogen getoond worden en/of de bezoeker naar een merchant sturen.
 * Broken / soft-deleted offers horen nergens; zonder https-URL geen outbound CTA.
 * Zoek-URL's (bol /s/, Coolblue /zoeken) zijn geen productpagina: geen outbound.
 */

export type OfferOutboundFields = {
  deleted_at?: string | null;
  affiliate_link_status?: "ok" | "pending" | "broken" | null;
  affiliate_url?: string | null;
  affiliate_deeplink?: string | null;
};

/** True bij merchant zoek/listing i.p.v. concrete product-URL. */
export function isSearchOrListingUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname.replace(/\/+$/, "");
    if (host.endsWith("bol.com") && (path === "/nl/nl/s" || path.endsWith("/s"))) {
      return true;
    }
    if (u.searchParams.has("searchtext")) return true;
    if (host.endsWith("coolblue.nl") && path.includes("/zoeken")) return true;
    if (u.searchParams.has("query") && path.includes("zoeken")) return true;
    return false;
  } catch {
    return false;
  }
}

export function offerOutboundUrl(offer: OfferOutboundFields): string | null {
  const url = offer.affiliate_deeplink ?? offer.affiliate_url ?? null;
  if (!url || !url.startsWith("https://")) return null;
  if (isSearchOrListingUrl(url)) return null;
  return url;
}

/** Actief in catalogus (prijs mag getoond), niet soft-deleted/broken. */
export function isActiveOffer(offer: OfferOutboundFields): boolean {
  if (offer.deleted_at) return false;
  if (offer.affiliate_link_status === "broken") return false;
  return true;
}

/** Mag achter "Bekijk beste prijs" /api/go. */
export function isEligibleOutboundOffer(offer: OfferOutboundFields): boolean {
  return isActiveOffer(offer) && offerOutboundUrl(offer) !== null;
}
