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
function isSearchOrListingUrlAtDepth(url: string, depth: number): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname.replace(/\/+$/, "");
    if (host === "partner.bol.com" && depth < 2) {
      const destination = u.searchParams.get("url");
      if (destination && isSearchOrListingUrlAtDepth(destination, depth + 1)) {
        return true;
      }
    }
    if (host.endsWith("bol.com") && (path === "/nl/nl/s" || path.endsWith("/s"))) {
      return true;
    }
    if (u.searchParams.has("searchtext")) return true;
    if (host.endsWith("coolblue.nl") && path.includes("/zoeken")) return true;
    if (u.searchParams.has("query") && path.includes("zoeken")) return true;
    // WordPress/zoek: ?s=foo op homepage-achtige path
    if (u.searchParams.has("s") && (path === "" || path === "/")) return true;
    // Gamma categorie/listing, geen productdetail
    if (host.endsWith("gamma.nl") && path.includes("/assortiment/")) return true;
    // Kale merchant-homepages (geen product)
    if (
      (host.endsWith("coolblue.nl") || host.endsWith("gamma.nl") || host === "bol.com") &&
      (path === "" || path === "/" || path === "/nl" || path === "/nl/nl")
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function isSearchOrListingUrl(url: string): boolean {
  return isSearchOrListingUrlAtDepth(url, 0);
}

export function offerOutboundUrl(offer: OfferOutboundFields): string | null {
  const url = offer.affiliate_deeplink ?? offer.affiliate_url ?? null;
  if (!url || !url.startsWith("https://")) return null;
  if (isSearchOrListingUrl(url)) return null;
  return url;
}

/** Actief in catalogus (prijs mag getoond), niet soft-deleted/broken/zoek-URL. */
export function isActiveOffer(offer: OfferOutboundFields): boolean {
  if (offer.deleted_at) return false;
  if (offer.affiliate_link_status === "broken") return false;
  const url = offer.affiliate_deeplink ?? offer.affiliate_url;
  if (url && isSearchOrListingUrl(url)) return false;
  return true;
}

/** Mag achter "Bekijk beste prijs" /api/go. Alleen status ok (geen pending/broken). */
export function isEligibleOutboundOffer(offer: OfferOutboundFields): boolean {
  if (!isActiveOffer(offer)) return false;
  if (offer.affiliate_link_status !== "ok") return false;
  return offerOutboundUrl(offer) !== null;
}
