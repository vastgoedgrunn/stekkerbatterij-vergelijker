/**
 * Welke offers mogen getoond worden en/of de bezoeker naar een merchant sturen.
 * Broken / soft-deleted offers horen nergens; zonder https-URL geen outbound CTA.
 */

export type OfferOutboundFields = {
  deleted_at?: string | null;
  affiliate_link_status?: "ok" | "pending" | "broken" | null;
  affiliate_url?: string | null;
  affiliate_deeplink?: string | null;
};

const BLOCKED_DESTINATIONS = new Set([
  "www.coolblue.nl/product/904321",
  "www.coolblue.nl/product/905678",
  "www.zonneplan.nl/thuisbatterij/marstek-venus",
  "www.zonneplan.nl/thuisbatterij/sessy",
]);

export function offerOutboundUrl(offer: OfferOutboundFields): string | null {
  const url = offer.affiliate_deeplink ?? offer.affiliate_url ?? null;
  if (!url || !url.startsWith("https://")) return null;
  return url;
}

/**
 * Alleen een productspecifieke merchantbestemming telt als geverifieerde
 * outbound. Zoekpagina's en bekende defecte bestemmingen bewijzen geen SKU-match.
 */
export function isProductSpecificOutboundUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    const destinationKey = `${hostname}${pathname}`.replace(/^zonneplan\.nl/, "www.zonneplan.nl");

    if (hostname === "solarsale.nl" || hostname === "www.solarsale.nl") return false;
    if (BLOCKED_DESTINATIONS.has(destinationKey)) return false;
    if (pathname === "/") return false;
    if (url.searchParams.has("searchtext") || url.searchParams.has("s")) return false;
    if (pathname === "/zoeken" || pathname.includes("/search")) return false;
    if (pathname.includes("/assortiment/k/")) return false;

    if (hostname === "partner.bol.com") {
      const innerDestination = url.searchParams.get("url");
      return innerDestination ? isProductSpecificOutboundUrl(innerDestination) : false;
    }

    if (hostname === "bol.com" || hostname === "www.bol.com") {
      return pathname.startsWith("/nl/nl/p/");
    }

    if (hostname === "coolblue.nl" || hostname === "www.coolblue.nl") {
      return pathname.startsWith("/product/");
    }

    return true;
  } catch {
    return false;
  }
}

/** Actief in catalogus (prijs mag getoond), niet soft-deleted/broken. */
export function isActiveOffer(offer: OfferOutboundFields): boolean {
  if (offer.deleted_at) return false;
  if (offer.affiliate_link_status === "broken") return false;
  return true;
}

/** Mag achter "Bekijk beste prijs" /api/go. */
export function isEligibleOutboundOffer(offer: OfferOutboundFields): boolean {
  const destination = offerOutboundUrl(offer);
  return (
    isActiveOffer(offer) &&
    offer.affiliate_link_status === "ok" &&
    destination !== null &&
    isProductSpecificOutboundUrl(destination)
  );
}
