import "server-only";
import { createMollieClient, type MollieClient } from "@mollie/api-client";
import { serverEnv } from "@/lib/env/server";

/**
 * Server-only Mollie-client. Alles is een no-op zolang MOLLIE_API_KEY
 * ontbreekt (graceful, net als `isSupabaseConfigured`): de shop blijft dan
 * uit en checkout-acties geven een nette foutmelding in plaats van te crashen.
 *
 * Verificatie van betalingen gebeurt niet op basis van de webhook-payload maar
 * door de betaling opnieuw op te vragen via de API (`payments.get`).
 */
export function isMollieConfigured(): boolean {
  return Boolean(serverEnv.MOLLIE_API_KEY);
}

let cached: MollieClient | null = null;

export function getMollieClient(): MollieClient {
  const apiKey = serverEnv.MOLLIE_API_KEY;
  if (!apiKey) {
    throw new Error("MOLLIE_API_KEY ontbreekt, betaalintegratie is niet geconfigureerd.");
  }
  cached ??= createMollieClient({ apiKey });
  return cached;
}

/** Zet centen om naar het Mollie-bedragformaat ("12.34"). */
export function toMollieAmountValue(cents: number): string {
  return (cents / 100).toFixed(2);
}
