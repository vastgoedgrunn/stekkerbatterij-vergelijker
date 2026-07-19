/** Bol Partner deeplink helpers (geen secrets; publisher-ID als argument). */

const BOL_PRODUCT_PATH = /\/p\/[^/]+\/\d{10,}\/?/i;

/** True bij een echte bol productpagina (`/p/{slug}/{id}/`). */
export function isBolProductUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname.endsWith("bol.com") && BOL_PRODUCT_PATH.test(u.pathname);
  } catch {
    return false;
  }
}

export function isBolPartnerClickUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === "partner.bol.com" && u.pathname.includes("/click");
  } catch {
    return false;
  }
}

/** Bouw partner-deeplink: `partner.bol.com/click/...&s={siteId}&url=...`. */
export function buildBolPartnerDeeplink(
  productUrl: string,
  publisherId: string | undefined | null,
): string | null {
  const publisher = publisherId?.trim();
  if (!publisher || !productUrl.startsWith("https://")) return null;
  if (!isBolProductUrl(productUrl)) return null;
  const encoded = encodeURIComponent(productUrl);
  return `https://partner.bol.com/click/click?p=2&t=url&s=${publisher}&url=${encoded}`;
}

/**
 * Zorg dat een bol-bestemming een partner-deeplink met het juiste site-ID is.
 * Homepage/zoek-URLs blijven onaangeraakt.
 */
export function ensureBolPartnerDeeplink(
  destination: string,
  publisherId: string | undefined | null,
): string {
  const publisher = publisherId?.trim();
  if (!publisher) return destination;

  if (isBolPartnerClickUrl(destination)) {
    try {
      const u = new URL(destination);
      u.searchParams.set("s", publisher);
      return u.toString();
    } catch {
      return destination;
    }
  }

  return buildBolPartnerDeeplink(destination, publisher) ?? destination;
}
