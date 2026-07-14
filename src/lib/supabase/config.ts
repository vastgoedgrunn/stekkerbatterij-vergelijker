import { clientEnv } from "@/lib/env/client";

/**
 * Geeft aan of de Supabase-verbinding geconfigureerd is. De repository-laag
 * gebruikt dit om netjes lege data terug te geven zolang de database (nog)
 * niet gekoppeld is, zodat de site zonder crash rendert.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(clientEnv.NEXT_PUBLIC_SUPABASE_URL && clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseUrl(): string {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL ontbreekt.");
  }
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY ontbreekt.");
  }
  return key;
}
