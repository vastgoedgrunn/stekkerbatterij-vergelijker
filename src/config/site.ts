import { clientEnv } from "@/lib/env/client";

/**
 * Centrale site-configuratie. Één bron van waarheid voor merknaam,
 * URL's en metadata-defaults (gebruikt door SEO en layout).
 */
export const siteConfig = {
  name: "Stekkerbatterij Vergelijker",
  shortName: "Stekkerbatterij",
  description:
    "Het onafhankelijke Nederlandse platform om plug-and-play stekkerbatterijen te vergelijken op prijs, capaciteit, vermogen en garantie.",
  url: clientEnv.NEXT_PUBLIC_SITE_URL,
  locale: "nl_NL",
  language: "nl",
  themeColor: "#0a6b4c",
  contactEmail: "info@stekkerbatterij-vergelijker.nl",
  twitterHandle: undefined,
  keywords: [
    "stekkerbatterij",
    "thuisbatterij",
    "plug-and-play batterij",
    "batterij vergelijken",
    "thuisaccu",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
