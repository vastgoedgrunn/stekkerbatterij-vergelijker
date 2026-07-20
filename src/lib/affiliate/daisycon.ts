/**
 * Daisycon trackinglink-opbouw (officiele structuur, zie
 * https://faq-publisher.daisycon.com/hc/nl/articles/204787042):
 *
 *   https://glp8.net/c/?si=<campagne-id>&li=<link-id>&wi=<media-id>&ws=<subid>&dl=<pad>
 *
 * Daisycon genereert vaak glp8.net; sommige adverteerders (zoals HomeWizard)
 * gebruiken een eigen partner-domein (partner.homewizard.com). Beide werken
 * met dezelfde query-parameters. ds1.nl redirect nog door.
 *
 * - `si` is het campagne-ID (bv. 20779 voor Zendure NL, 18407 voor HomeWizard INT).
 * - `li` is het link-ID van de campagne; verplicht, alleen zichtbaar in het
 *   Daisycon publisher-dashboard (Materiaal, Deeplinks).
 * - `wi` is het media-ID van onze site.
 * - `ws` is de Sub ID voor eigen tracking. Laat leeg in de opgeslagen URL en zet
 *   `{"ws":"{click_ref}"}` in `offers.affiliate_params` zodat de redirect-route
 *   die per klik invult (URLSearchParams encodeert accolades).
 * - `dl` bevat alleen het URL-pad na de domeinnaam van de adverteerder
 *   (Daisycon-vereiste), url-encoded.
 */

export const DAISYCON_TRACKING_ORIGIN = "https://glp8.net";
/** HomeWizard INT (si=18407) gebruikt dit partner-domein i.p.v. glp8.net. */
export const HOMEWIZARD_DAISYCON_ORIGIN = "https://partner.homewizard.com";

export interface DaisyconDeeplinkInput {
  /** Campagne-ID (si), bv. "20779". */
  campaignId: string;
  /** Link-ID (li) uit het Daisycon-dashboard voor deze campagne. */
  linkId: string;
  /** Media-ID (wi) van onze site in Daisycon. */
  mediaId: string;
  /** Volledige https-URL van de productpagina bij de adverteerder. */
  destinationUrl: string;
  /** Sub ID (ws); concrete waarde, of weglaten (runtime via affiliate_params). */
  subId?: string;
  /** Tracking-origin; default glp8.net. HomeWizard: partner.homewizard.com. */
  trackingOrigin?: string;
}

export function buildDaisyconDeeplink(input: DaisyconDeeplinkInput): string {
  const destination = new URL(input.destinationUrl);
  if (destination.protocol !== "https:") {
    throw new Error("Daisycon-deeplink vereist een https-bestemming.");
  }
  if (!input.campaignId || !input.linkId || !input.mediaId) {
    throw new Error("Daisycon-deeplink vereist campaignId, linkId en mediaId.");
  }

  const pathAfterDomain =
    destination.pathname.replace(/^\//, "") + destination.search + destination.hash;

  const origin = (input.trackingOrigin ?? DAISYCON_TRACKING_ORIGIN).replace(/\/$/, "");
  const url = new URL(`${origin}/c/`);
  url.searchParams.set("si", input.campaignId);
  url.searchParams.set("li", input.linkId);
  url.searchParams.set("wi", input.mediaId);
  // Geen `{click_ref}` hier: URLSearchParams encodeert accolades (%7B/%7D) en
  // dan faalt substituteClickRef in buildAffiliateDestination.
  url.searchParams.set("ws", input.subId && input.subId !== "{click_ref}" ? input.subId : "");
  url.searchParams.set("dl", pathAfterDomain);
  return url.toString();
}

/**
 * Daisycon productfeed-URL (zie https://daisycon.com/en/developers/productfeeds/building-a-url/).
 * Vereist een goedgekeurd media voor de campagne; anders antwoordt de feed met HTTP 204.
 */
export function buildDaisyconFeedUrl(input: {
  programId: string;
  mediaId: string;
  type?: "xml" | "json" | "csv";
}): string {
  const url = new URL("https://daisycon.io/datafeed/");
  url.searchParams.set("program_id", input.programId);
  url.searchParams.set("media_id", input.mediaId);
  url.searchParams.set("standard_id", "1");
  url.searchParams.set("language_code", "nl");
  url.searchParams.set("locale_id", "1");
  url.searchParams.set("type", input.type ?? "json");
  return url.toString();
}
