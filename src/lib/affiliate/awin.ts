/** Awin deeplink helpers (publisher-ID als argument; geen secrets). */

export const ECOFLOW_NL_AWIN_ADVERTISER_ID = "123332";
export const COOLBLUE_NL_AWIN_ADVERTISER_ID = "85161";
export const COOLBLUE_ENERGIE_NL_AWIN_ADVERTISER_ID = "85163";

export function isAwinClickUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      (u.hostname === "www.awin1.com" || u.hostname === "awin1.com") &&
      u.pathname.includes("/cread.php")
    );
  } catch {
    return false;
  }
}

/**
 * Bouw Awin click-through: awin1.com/cread.php?awinmid=&awinaffid=&ued=&clickref=
 * @see https://wiki.awin.com/index.php/Publisher_Deeplinks
 */
export function buildAwinDeeplink(input: {
  advertiserId: string;
  publisherId: string | undefined | null;
  destinationUrl: string;
  clickRef?: string | null;
}): string | null {
  const publisher = input.publisherId?.trim();
  const advertiser = input.advertiserId.trim();
  if (!publisher || !advertiser) return null;
  if (!input.destinationUrl.startsWith("https://")) return null;

  const u = new URL("https://www.awin1.com/cread.php");
  u.searchParams.set("awinmid", advertiser);
  u.searchParams.set("awinaffid", publisher);
  u.searchParams.set("ued", input.destinationUrl);
  if (input.clickRef?.trim()) {
    u.searchParams.set("clickref", input.clickRef.trim());
  }
  return u.toString();
}

/**
 * Zorg dat een Awin-bestemming de juiste publisher (awinaffid) heeft.
 * Product-URL's van EcoFlow NL worden gewrapt wanneer publisher bekend is.
 */
export function ensureAwinDeeplink(
  destination: string,
  publisherId: string | undefined | null,
  advertiserId: string = ECOFLOW_NL_AWIN_ADVERTISER_ID,
): string {
  const publisher = publisherId?.trim();
  if (!publisher) return destination;

  if (isAwinClickUrl(destination)) {
    try {
      const u = new URL(destination);
      u.searchParams.set("awinaffid", publisher);
      if (!u.searchParams.get("awinmid")) {
        u.searchParams.set("awinmid", advertiserId);
      }
      return u.toString();
    } catch {
      return destination;
    }
  }

  try {
    const host = new URL(destination).hostname.replace(/^www\./, "");
    if (host === "nl.ecoflow.com" || host === "eu.ecoflow.com" || host === "ecoflow.com") {
      return (
        buildAwinDeeplink({
          advertiserId,
          publisherId: publisher,
          destinationUrl: destination,
        }) ?? destination
      );
    }
  } catch {
    return destination;
  }

  return destination;
}
