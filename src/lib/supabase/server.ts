import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/db/database.types";
import { getSupabaseAnonKey, getSupabaseUrl } from "./config";

/**
 * Supabase-client voor Server Components, Server Actions en Route Handlers.
 * Respecteert RLS via de sessie-cookies. In Next.js 16 is `cookies()` async.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Aangeroepen vanuit een Server Component: cookies zijn read-only.
          // De sessie wordt ververst in proxy.ts, dus dit is veilig te negeren.
        }
      },
    },
  });
}
