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

export function offerOutboundUrl(offer: OfferOutboundFields): string | null {
  const url = offer.affiliate_deeplink ?? offer.affiliate_url ?? null;
  if (!url || !url.startsWith("https://")) return null;
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
