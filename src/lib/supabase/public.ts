import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import { getSupabaseAnonKey, getSupabaseUrl } from "./config";

/**
 * Cookieloze anonieme client voor PUBLIEKE reads (catalogus, content).
 * Omdat er geen cookies gelezen worden, blijven pagina's statisch/ISR-baar,
 * essentieel voor performance bij veel verkeer. RLS beperkt tot publieke data.
 */
export function createSupabasePublicClient() {
  return createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
