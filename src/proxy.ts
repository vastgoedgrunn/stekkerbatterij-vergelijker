import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { AB_COOKIE_MAX_AGE_SECONDS, AB_COOKIE_NAME } from "@/lib/experiments/experiments";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Ververst de Supabase-sessie op elke (niet-statische) request, zodat
 * auth-cookies geldig blijven in Server Components. No-op zolang de
 * database niet geconfigureerd is. Zet daarnaast de first-party
 * A/B-testcookie `sbv_ab_id` zodra die ontbreekt, zodat elke bezoeker vanaf
 * de eerste request een stabiel anoniem id heeft voor experimenttoewijzing.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (isSupabaseConfigured()) {
    const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });

    await supabase.auth.getUser();
  }

  if (!request.cookies.has(AB_COOKIE_NAME)) {
    response.cookies.set(AB_COOKIE_NAME, crypto.randomUUID(), {
      maxAge: AB_COOKIE_MAX_AGE_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
