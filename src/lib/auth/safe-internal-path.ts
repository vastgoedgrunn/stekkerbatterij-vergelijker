/**
 * Alleen relatieve interne paden toestaan (open-redirect preventie).
 * Fallback bij alles dat op een externe of protocol-URL lijkt.
 */
export function safeInternalPath(path: string | null | undefined, fallback = "/account"): string {
  if (!path) return fallback;
  if (!path.startsWith("/")) return fallback;
  if (path.startsWith("//")) return fallback;
  if (path.includes("@") || path.includes("\\")) return fallback;
  if (path.includes("://")) return fallback;
  // Geen scheme-achtige prefix na de slash (bijv. /javascript:...).
  if (/^\/[a-z][a-z0-9+.-]*:/i.test(path)) return fallback;
  return path;
}
