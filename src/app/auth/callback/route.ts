import { NextResponse } from "next/server";
import { safeInternalPath } from "@/lib/auth/safe-internal-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Wisselt Supabase e-mailbevestiging / magic-link code om voor een sessie. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeInternalPath(searchParams.get("next"), "/account");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/account?error=auth`);
}
