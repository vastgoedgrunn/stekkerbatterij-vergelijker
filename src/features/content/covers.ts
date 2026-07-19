import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import { getPublicImageUrl } from "@/lib/supabase/storage";

/**
 * Convention: elke gids-slug heeft `public/images/guides/<slug>.png`.
 * Optionele overrides alleen als bestandsnaam afwijkt van de slug.
 */
const LOCAL_GUIDE_COVER_OVERRIDES: Record<string, string> = {};

function localGuideCoverFromDisk(slug: string): string | null {
  const override = LOCAL_GUIDE_COVER_OVERRIDES[slug];
  if (override) {
    const overrideAbs = path.join(process.cwd(), "public", override.replace(/^\//, ""));
    return existsSync(overrideAbs) ? override : null;
  }

  const relative = `/images/guides/${slug}.png`;
  const absolute = path.join(process.cwd(), "public", "images", "guides", `${slug}.png`);
  return existsSync(absolute) ? relative : null;
}

/**
 * Beste cover voor een gids: database/Storage eerst, anders lokale PNG op disk.
 * Retourneert nooit een pad naar een bestand dat lokaal ontbreekt.
 */
export function getGuideCoverUrl(article: {
  slug: string;
  coverImagePath?: string | null;
}): string | null {
  const fromDb = getPublicImageUrl(article.coverImagePath ?? null);
  if (fromDb) return fromDb;
  return localGuideCoverFromDisk(article.slug);
}
