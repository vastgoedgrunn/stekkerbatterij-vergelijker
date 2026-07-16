import "server-only";
import { z } from "zod";

/**
 * Server-only omgevingsvariabelen (secrets). Dit bestand mag NOOIT
 * in een Client Component belanden; `server-only` dwingt dat af.
 *
 * Variabelen zijn nu optioneel omdat integraties gefaseerd worden
 * aangesloten. Zodra een agent een integratie toevoegt, maakt die
 * de betreffende variabele verplicht (verwijder `.optional()`).
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database / Supabase
  DATABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Payments (release 2): Mollie.
  // De webhook her-bevraagt de betaalstatus via de Mollie API (geen aparte
  // webhook-secret nodig); daarom volstaat de API-key. Ontbreekt de key, dan
  // is de betaalintegratie een no-op (graceful, net als Supabase).
  MOLLIE_API_KEY: z.string().min(1).optional(),

  // Shipping (release 2)
  SENDCLOUD_API_KEY: z.string().min(1).optional(),
  SENDCLOUD_API_SECRET: z.string().min(1).optional(),

  // Transactionele e-mail (release 2): Resend.
  // Ontbreekt de key of het afzenderadres, dan is e-mail een no-op (graceful).
  // EMAIL_FROM bv. "Stekkerbatterij Vergelijker <noreply@jouwdomein.nl>".
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),

  // Observability
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(),

  /** Daisycon bestandsverificatie: body + bestandsnaam (rewrite in next.config). */
  DAISYCON_VERIFY_FILENAME: z.string().min(1).optional(),
  DAISYCON_VERIFY_FILE_BODY: z.string().min(1).optional(),

  /** Daisycon media-ID (wi-parameter in ds1.nl trackinglinks en feed-URLs). */
  DAISYCON_MEDIA_ID: z.string().min(1).optional(),

  /** e-WNDR thuisbatterij-lead affiliate quote-URL (consumer landing, niet affiliate-worden). */
  EWNDR_LEAD_AFFILIATE_URL: z.string().url().optional(),

  /** Bol Partner / productfeed (Catalog Discovery). Ontbreekt = stub, geen live feed. */
  BOL_PARTNER_API_KEY: z.string().min(1).optional(),
  BOL_PRODUCT_FEED_URL: z.string().url().optional(),
  BOL_PUBLISHER_ID: z.string().min(1).optional(),
});

const skipValidation = process.env.SKIP_ENV_VALIDATION === "true";

const parsed = skipValidation
  ? serverSchema.partial().safeParse(process.env)
  : serverSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Ongeldige server-omgevingsvariabelen:\n${z.prettifyError(parsed.error)}`);
}

export const serverEnv = parsed.data;
export type ServerEnv = typeof serverEnv;
