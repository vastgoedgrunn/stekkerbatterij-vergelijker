import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/db/database.types";
import { getSupabaseAnonKey, getSupabaseUrl } from "./config";

/**
 * Supabase-client voor Client Components (browser). Alleen gebruiken in
 * client-eilanden die interactiviteit vereisen (bv. auth-formulieren).
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
}
