import { clientEnv } from "@/lib/env/client";

/**
 * Centrale site-configuratie. Één bron van waarheid voor merknaam,
 * URL's en metadata-defaults (gebruikt door SEO en layout).
 */
export const siteConfig = {
  name: "Stekkerbatterij Vergelijker",
  shortName: "Stekkerbatterij",
  /** Homepage title: keyword eerst, max ~60 tekens voor SERP. */
  titleDefault: "Stekkerbatterij vergelijken: prijzen, capaciteit en garantie",
  description:
    "Vergelijk stekkerbatterijen en vaste thuisbatterijen op prijs, capaciteit en garantie. Onafhankelijk, met actuele aanbieders. Start in 2 minuten.",
  url: clientEnv.NEXT_PUBLIC_SITE_URL,
  locale: "nl_NL",
  language: "nl",
  themeColor: "#0a6b4c",
  contactEmail: "info@stekkerbatterijvergelijker.com",
  supportEmail: "support@stekkerbatterijvergelijker.com",
  twitterHandle: undefined,
  /** Vierkant merkteken voor Google favicon / Organization logo (min. 48×48). */
  logoMarkPath: "/images/brand/logo-mark.png",
  logoPath: "/images/brand/logo.png",
  keywords: [
    "stekkerbatterij",
    "stekkerbatterij vergelijken",
    "thuisbatterij",
    "vaste thuisbatterij",
    "thuisbatterij installatie",
    "plug-and-play batterij",
    "batterij vergelijken",
    "thuisaccu",
    "beste stekkerbatterij",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
