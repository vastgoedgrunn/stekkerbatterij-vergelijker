import { serverEnv } from "@/lib/env/server";

/** Daisycon bestandsverificatie (rewrite van /{filename} → deze route). */
export function GET() {
  const body = serverEnv.DAISYCON_VERIFY_FILE_BODY;
  if (!body) {
    return new Response("Not Found", { status: 404 });
  }
  return new Response(body, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
