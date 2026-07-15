import { businessRules } from "@/config/business-rules";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * ÉÉN bron van waarheid voor alle juridische / bedrijfsgegevens.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * De eigenaar vult ALLES hier in — deze waarden worden automatisch getoond op
 * /algemene-voorwaarden, /herroepingsrecht, /privacybeleid en /garantie.
 * Niets is elders hardcoded.
 *
 * Zoek op "TODO" en vervang elke placeholder door de echte gegevens uit de
 * KvK-inschrijving. Zolang een waarde nog een placeholder is, tonen de pagina's
 * dit zichtbaar zodat er niets onbedoeld met dummy-gegevens live gaat.
 */

/** Placeholder-marker: gebruikt om te detecteren of een veld nog ingevuld moet worden. */
export const LEGAL_TODO = "TODO" as const;

export const legalConfig = {
  /** Statutaire / handelsnaam zoals ingeschreven bij de KvK. */
  companyName: "Stekkerbatterij Vergelijker",
  /** Handelsnaam / merknaam waaronder de webshop opereert. */
  tradeName: "Stekkerbatterij Vergelijker",

  /** KvK-nummer (8 cijfers). */
  kvkNumber: "93043809",
  /** Btw-identificatienummer (NL........B..). */
  vatNumber: "TODO — Btw-nummer (NL...B..)",

  /** Vestigings-/bezoekadres. */
  address: {
    street: "Helper Brink 27a",
    postalCode: "9722 EG",
    city: "Groningen",
    country: "Nederland",
  },

  /** Contactgegevens die klanten mogen gebruiken. */
  contact: {
    email: "support@stekkerbatterijvergelijker.com",
    /** Telefoonnummer voor klantcontact (verplicht bij verkoop op afstand). */
    phone: "TODO — telefoonnummer",
    /** Bereikbaarheid, bv. "werkdagen 9:00–17:00". */
    hours: "werkdagen 9:00–17:00",
  },

  /** Domein zonder protocol, voor weergave. */
  domain: "stekkerbatterijvergelijker.com",

  /** Btw-tarief (fractie) — afgeleid uit business-rules zodat er één bron is. */
  vatRate: businessRules.vatRate,

  /**
   * Bedenktijd bij koop op afstand (EU-herroepingsrecht) in dagen.
   * Wettelijk minimum is 14 dagen.
   */
  withdrawalPeriodDays: 14,

  /**
   * Datum van laatste inhoudelijke wijziging van de juridische teksten.
   * Werk dit bij zodra de eigenaar/jurist de definitieve versie vaststelt.
   */
  lastUpdated: "2026-07-15",
} as const;

export type LegalConfig = typeof legalConfig;

/** True zolang een veld nog een niet-ingevulde placeholder is. */
export function isLegalPlaceholder(value: string): boolean {
  return value.startsWith(LEGAL_TODO);
}

/** Volledig adres als één regel; toont placeholders indien nog niet ingevuld. */
export function formattedAddress(): string {
  const { street, postalCode, city, country } = legalConfig.address;
  return [street, [postalCode, city].filter(Boolean).join(" "), country].filter(Boolean).join(", ");
}
