/**
 * Haal een productfoto-URL uit HTML (og:image / twitter:image / JSON-LD).
 */
export function extractProductImageFromHtml(html: string): string | null {
  const patterns = [
    /property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*property=["']og:image(?::secure_url)?["']/i,
    /name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i,
    /"image"\s*:\s*\[\s*"((?:https?:)?\/\/[^"]+)"/i,
    /"image"\s*:\s*"((?:https?:)?\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match?.[1]) continue;
    const url = normalizeImageUrl(match[1]);
    if (url && isLikelyProductImage(url)) return url;
  }

  return null;
}

function normalizeImageUrl(raw: string): string | null {
  const trimmed = raw.trim().replace(/\\+/g, "");
  if (!trimmed) return null;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("http://")) return `https://${trimmed.slice("http://".length)}`;
  if (trimmed.startsWith("https://")) return trimmed;
  return null;
}

/** Filter logo's / icons die geen productshot zijn. */
function isLikelyProductImage(url: string): boolean {
  const lower = url.toLowerCase();
  if (lower.includes("logo") && !lower.includes("product")) return false;
  if (lower.includes("favicon") || lower.includes("icon.png")) return false;
  if (lower.includes("open-graph-sessy-logo")) return false;
  return true;
}

/**
 * Fetch productpagina en extraheer image-URL.
 */
export async function fetchProductPageImageUrl(pageUrl: string): Promise<string | null> {
  if (!pageUrl.startsWith("https://")) return null;
  try {
    const res = await fetch(pageUrl, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "StekkerbatterijVergelijkerBot/1.0 (image-ingest)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    return extractProductImageFromHtml(html);
  } catch {
    return null;
  }
}
