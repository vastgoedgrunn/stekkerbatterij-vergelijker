import { clientEnv } from "@/lib/env/client";

/**
 * Bouwt de publieke URL voor een bestand in Supabase Storage.
 * Geeft null terug als de opslag niet geconfigureerd is of geen pad bestaat,
 * zodat componenten netjes op een placeholder terugvallen.
 */
export function getPublicImageUrl(path: string | null, bucket = "products"): string | null {
  if (!path) return null;
  const base = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
