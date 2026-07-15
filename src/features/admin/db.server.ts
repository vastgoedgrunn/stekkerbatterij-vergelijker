import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { serverEnv } from "@/lib/env/server";

/** Service-role client voor admin-lees/schrijf na expliciete rolcheck in de aanroeper. */
export function getAdminDb() {
  if (!isSupabaseConfigured() || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Admin-database niet geconfigureerd.");
  }
  return createSupabaseServiceClient();
}
