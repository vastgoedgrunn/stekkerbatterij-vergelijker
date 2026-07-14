import { z } from "zod";

/**
 * Publieke, client-veilige omgevingsvariabelen (NEXT_PUBLIC_*).
 * Deze mogen overal geïmporteerd worden. Nooit secrets hier plaatsen.
 *
 * Belangrijk: elke variabele wordt expliciet gerefereerd zodat Next.js
 * de waarde bij build inlined.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().min(1).optional(),
  NEXT_PUBLIC_PLAUSIBLE_HOST: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
});

const parsed = clientSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
  NEXT_PUBLIC_PLAUSIBLE_HOST: process.env.NEXT_PUBLIC_PLAUSIBLE_HOST,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
});

if (!parsed.success) {
  throw new Error(`Ongeldige publieke omgevingsvariabelen:\n${z.prettifyError(parsed.error)}`);
}

export const clientEnv = parsed.data;
export type ClientEnv = typeof clientEnv;
