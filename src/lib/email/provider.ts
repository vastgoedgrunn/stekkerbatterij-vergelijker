import "server-only";
import { serverEnv } from "@/lib/env/server";
import { logger } from "@/lib/observability/logger";
import type { EmailMessage, EmailProvider, SendResult } from "./types";

/**
 * Transactionele e-mail met een provider-abstractie. Standaard Resend (via de
 * REST API, geen extra SDK-afhankelijkheid). Later is een SMTP-provider (bv.
 * Google Workspace) toe te voegen door een tweede `EmailProvider` te leveren.
 *
 * Alles is een no-op zolang RESEND_API_KEY én EMAIL_FROM ontbreken (graceful,
 * net als de Supabase- en Mollie-integraties): er wordt niets verstuurd en er
 * crasht niets.
 */
export function isEmailConfigured(): boolean {
  return Boolean(serverEnv.RESEND_API_KEY && serverEnv.EMAIL_FROM);
}

/** No-op provider wanneer e-mail niet geconfigureerd is. */
const noopProvider: EmailProvider = {
  name: "noop",
  async send() {
    return { sent: false };
  },
};

/** Resend-provider via de REST API. */
function createResendProvider(apiKey: string, from: string): EmailProvider {
  return {
    name: "resend",
    async send(message: EmailMessage): Promise<SendResult> {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: message.to,
            subject: message.subject,
            html: message.html,
            text: message.text,
          }),
        });

        if (!response.ok) {
          const detail = await response.text();
          logger.warn("Resend-verzending mislukt", { status: response.status, detail });
          return { sent: false, error: `resend-${response.status}` };
        }

        const data: unknown = await response.json();
        const id =
          typeof data === "object" && data !== null && "id" in data
            ? String((data as { id: unknown }).id)
            : undefined;
        return { sent: true, id };
      } catch (error) {
        logger.warn("Resend-verzending gooide een fout", {
          message: error instanceof Error ? error.message : "onbekend",
        });
        return { sent: false, error: "resend-exception" };
      }
    },
  };
}

function getProvider(): EmailProvider {
  const { RESEND_API_KEY, EMAIL_FROM } = serverEnv;
  if (RESEND_API_KEY && EMAIL_FROM) {
    return createResendProvider(RESEND_API_KEY, EMAIL_FROM);
  }
  return noopProvider;
}

/**
 * Verstuurt een e-mail via de actieve provider. Best-effort: gooit nooit,
 * zodat aanroepers (zoals de betaalwebhook) er niet op stuk kunnen lopen.
 */
export async function sendEmail(message: EmailMessage): Promise<SendResult> {
  return getProvider().send(message);
}
