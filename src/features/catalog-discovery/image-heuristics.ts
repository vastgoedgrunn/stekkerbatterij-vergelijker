/**
 * Image OS heuristics: URL/content-filters vóór vision/ingest.
 */

const REJECT_URL_FRAGMENTS = [
  "logo",
  "favicon",
  "icon.png",
  "icon-",
  "badge",
  "keurmerk",
  "sehr-gut",
  "testurteil",
  "award",
  "sprite",
  "placeholder",
  "open-graph-sessy-logo",
];

const MIN_BYTES = 20 * 1024;
const MAX_BYTES = 5 * 1024 * 1024;

export function isRejectedImageUrl(url: string): boolean {
  const lower = url.toLowerCase();
  if (lower.includes("logo") && lower.includes("product")) return false;
  return REJECT_URL_FRAGMENTS.some((frag) => lower.includes(frag));
}

export function normalizeCandidateImageUrl(raw: string): string | null {
  const trimmed = raw.trim().replace(/\\+/g, "");
  if (!trimmed) return null;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("http://")) return `https://${trimmed.slice("http://".length)}`;
  if (trimmed.startsWith("https://")) return trimmed;
  return null;
}

export type ImageProbeResult =
  | { ok: true; contentType: string; bytes: number; buffer: Buffer }
  | { ok: false; reason: string };

/**
 * Download + basischecks (https, image/*, grootte). Geen vision.
 */
export async function probeImageUrl(sourceUrl: string): Promise<ImageProbeResult> {
  const url = normalizeCandidateImageUrl(sourceUrl);
  if (!url) return { ok: false, reason: "Ongeldige image-URL" };
  if (isRejectedImageUrl(url)) return { ok: false, reason: "URL lijkt logo/badge/placeholder" };

  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "StekkerbatterijVergelijkerBot/1.0 (image-os)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };

    const contentType = (res.headers.get("content-type") ?? "").split(";")[0]?.trim() ?? "";
    if (!contentType.startsWith("image/")) {
      return { ok: false, reason: `Geen image content-type (${contentType || "leeg"})` };
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength < MIN_BYTES) {
      return { ok: false, reason: `Image te klein (${buffer.byteLength} bytes)` };
    }
    if (buffer.byteLength > MAX_BYTES) {
      return { ok: false, reason: `Image te groot (${buffer.byteLength} bytes)` };
    }

    return { ok: true, contentType, bytes: buffer.byteLength, buffer };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Image probe mislukt",
    };
  }
}

/** Bestaat een publieke /images/... asset op deze origin? */
export async function probeLocalPublicImage(
  imagePath: string,
  siteOrigin: string,
): Promise<boolean> {
  if (!imagePath.startsWith("/images/")) return false;
  try {
    const res = await fetch(new URL(imagePath, siteOrigin).toString(), {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
