import { getPublicImageUrl } from "@/lib/supabase/storage";

/**
 * Lokale placeholder-covers per gids-slug (AI-gegenereerd, later vervangbaar).
 * Bewust in /public zodat ze zonder Storage werken en 1-op-1 te overschrijven zijn.
 */
const LOCAL_GUIDE_COVERS: Record<string, string> = {
  "balkon-of-thuisbatterij": "/images/guides/balkon-of-thuisbatterij.png",
  "dynamisch-contract-batterij": "/images/guides/dynamisch-contract-batterij.png",
  "stekkerbatterij-koopgids": "/images/guides/stekkerbatterij-koopgids.png",
  "saldering-afbouw": "/images/guides/saldering-afbouw.png",
};

/**
 * Beste covron voor een gids: een echte cover uit de database (Supabase Storage)
 * heeft voorrang; anders de lokale placeholder per slug; anders null.
 */
export function getGuideCoverUrl(article: {
  slug: string;
  coverImagePath?: string | null;
}): string | null {
  return getPublicImageUrl(article.coverImagePath ?? null) ?? LOCAL_GUIDE_COVERS[article.slug] ?? null;
}
