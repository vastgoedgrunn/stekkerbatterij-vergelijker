import { clientEnv } from "@/lib/env/client";

/**
 * Centrale site-configuratie. Één bron van waarheid voor merknaam,
 * URL's en metadata-defaults (gebruikt door SEO en layout).
 */
export const siteConfig = {
  name: "Stekkerbatterij Vergelijker",
  shortName: "Stekkerbatterij",
  description:
    "Het onafhankelijke Nederlandse platform om stekkerbatterijen en vaste thuisbatterijen te vergelijken op capaciteit, vermogen, garantie en prijs of offerte.",
  url: clientEnv.NEXT_PUBLIC_SITE_URL,
  locale: "nl_NL",
  language: "nl",
  themeColor: "#0a6b4c",
  contactEmail: "info@stekkerbatterijvergelijker.com",
  supportEmail: "support@stekkerbatterijvergelijker.com",
  twitterHandle: undefined,
  keywords: [
    "stekkerbatterij",
    "thuisbatterij",
    "vaste thuisbatterij",
    "thuisbatterij installatie",
    "plug-and-play batterij",
    "batterij vergelijken",
    "thuisaccu",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
