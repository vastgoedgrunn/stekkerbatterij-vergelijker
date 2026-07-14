import { businessRules } from "@/config/business-rules";

export interface VatBreakdown {
  /** Bedrag exclusief btw (centen). */
  subtotalCents: number;
  /** Btw-bedrag (centen). */
  vatCents: number;
  /** Totaal inclusief btw (centen). */
  totalCents: number;
  /** Toegepast btw-tarief als fractie. */
  vatRate: number;
}

/**
 * Rekent een brutobedrag (inclusief btw) uit naar een btw-uitsplitsing.
 * Consumentenprijzen in de catalogus zijn inclusief btw; we splitsen die
 * terug zodat orders en facturen een correcte uitsplitsing bewaren.
 */
export function breakdownFromGross(
  grossTotalCents: number,
  vatRate: number = businessRules.vatRate,
): VatBreakdown {
  const subtotalCents = Math.round(grossTotalCents / (1 + vatRate));
  const vatCents = grossTotalCents - subtotalCents;
  return { subtotalCents, vatCents, totalCents: grossTotalCents, vatRate };
}
