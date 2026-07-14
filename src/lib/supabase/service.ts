import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import { serverEnv } from "@/lib/env/server";
import { getSupabaseUrl } from "./config";

/**
 * Service-role client die RLS omzeilt. UITSLUITEND server-side gebruiken
 * (seed, admin-taken, systeemprocessen). Nooit blootstellen aan de client.
 */
export function createSupabaseServiceClient() {
  const serviceKey = serverEnv.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY ontbreekt.");
  }

  return createClient<Database>(getSupabaseUrl(), serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
