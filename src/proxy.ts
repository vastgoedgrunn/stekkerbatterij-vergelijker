import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { AB_COOKIE_MAX_AGE_SECONDS, AB_COOKIE_NAME } from "@/lib/experiments/experiments";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/config";

const ADMIN_ACCESS_ROLES = new Set(["admin", "editor", "merchant_manager"]);

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function copyCookies(source: NextResponse, destination: NextResponse): void {
  for (const cookie of source.cookies.getAll()) {
    destination.cookies.set(cookie);
  }
}

/**
 * Ververst de Supabase-sessie op elke (niet-statische) request, zodat
 * auth-cookies geldig blijven in Server Components. No-op zolang de
 * database niet geconfigureerd is. Zet daarnaast de first-party
 * A/B-testcookie `sbv_ab_id` zodra die ontbreekt, zodat elke bezoeker vanaf
 * de eerste request een stabiel anoniem id heeft voor experimenttoewijzing.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  let adminRedirect: URL | null = null;
  // Pathname voor root layout: admin zonder marketing header/footer.
  response.headers.set("x-pathname", request.nextUrl.pathname);

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
          response.headers.set("x-pathname", request.nextUrl.pathname);
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isAdminPath(request.nextUrl.pathname)) {
      if (!user) {
        adminRedirect = new URL("/account", request.url);
        adminRedirect.searchParams.set(
          "next",
          `${request.nextUrl.pathname}${request.nextUrl.search}`,
        );
      } else {
        const { data: roles, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .returns<{ role: string }[]>();
        const hasAdminAccess =
          !error && (roles ?? []).some(({ role }) => ADMIN_ACCESS_ROLES.has(role));
        if (!hasAdminAccess) {
          adminRedirect = new URL("/account", request.url);
        }
      }
    }
  } else if (isAdminPath(request.nextUrl.pathname)) {
    adminRedirect = new URL("/account", request.url);
    adminRedirect.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  }

  if (!request.cookies.has(AB_COOKIE_NAME)) {
    response.cookies.set(AB_COOKIE_NAME, crypto.randomUUID(), {
      maxAge: AB_COOKIE_MAX_AGE_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  if (adminRedirect) {
    const redirectResponse = NextResponse.redirect(adminRedirect);
    copyCookies(response, redirectResponse);
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
