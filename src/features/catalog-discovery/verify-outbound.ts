import { extractBolProductId, tokenizeTitle } from "./match-sku";
import type { OutboundVerifyResult } from "./types";

function isProductUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!u.protocol.startsWith("https")) return false;
    if (u.hostname.endsWith("bol.com")) {
      return /\/p\/[^/]+\/\d{10,}\/?/i.test(u.pathname);
    }
    const path = u.pathname.replace(/\/+$/, "");
    if (!path || path === "/") return false;
    if (u.searchParams.has("searchtext")) return false;
    return true;
  } catch {
    return false;
  }
}

function titleMatchesProduct(pageTitle: string, productName: string): boolean {
  const pageTokens = tokenizeTitle(pageTitle);
  const prodTokens = tokenizeTitle(productName);
  if (prodTokens.length === 0) return false;
  const hit = prodTokens.filter((t) => pageTokens.includes(t));
  return hit.length >= Math.min(2, prodTokens.length);
}

/**
 * Verifieer dat een outbound-URL bij dit product hoort.
 * Geen ok zonder product-URL + titel-overlap (of Bol-ID aanwezig + slug-tokens).
 */
export async function verifyOutboundForProduct(input: {
  url: string;
  productName: string;
  fetchPage?: boolean;
}): Promise<OutboundVerifyResult> {
  const { url, productName, fetchPage = true } = input;

  if (!url.startsWith("https://")) {
    return { ok: false, status: "broken", note: "Geen https-URL" };
  }

  if (!isProductUrl(url)) {
    return {
      ok: false,
      status: "pending",
      note: "Geen productpagina (homepage/zoek). Vul specifieke product-URL.",
    };
  }

  const bolId = extractBolProductId(url);
  const urlSlugTokens = tokenizeTitle(decodeURIComponent(url));
  const prodTokens = tokenizeTitle(productName);
  const urlOverlap = prodTokens.filter((t) => urlSlugTokens.includes(t));

  if (bolId && urlOverlap.length >= 2) {
    // Sterke URL-signalen; optioneel page fetch ter bevestiging.
    if (!fetchPage) {
      return {
        ok: true,
        status: "ok",
        note: `Bol-ID ${bolId} + slug match (${urlOverlap.join(", ")})`,
      };
    }
  }

  if (fetchPage) {
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { "User-Agent": "StekkerbatterijVergelijkerBot/1.0" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        return {
          ok: false,
          status: "broken",
          note: `HTTP ${res.status} bij outbound-check`,
        };
      }
      const html = (await res.text()).slice(0, 80_000);
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const ogMatch = html.match(/property=["']og:title["']\s+content=["']([^"']+)["']/i);
      const pageTitle = (ogMatch?.[1] ?? titleMatch?.[1] ?? "").trim();

      if (pageTitle && titleMatchesProduct(pageTitle, productName)) {
        return {
          ok: true,
          status: "ok",
          note: `Pagina-titel matcht product`,
          pageTitle,
        };
      }

      if (pageTitle) {
        return {
          ok: false,
          status: "broken",
          note: `SKU-mismatch: pagina "${pageTitle}" ≠ product "${productName}"`,
          pageTitle,
        };
      }

      // Geen title parsebaar: alleen ok bij sterke URL-signalen.
      if (bolId && urlOverlap.length >= 2) {
        return {
          ok: true,
          status: "ok",
          note: `Geen <title> parsebaar; Bol-ID + slug voldoende`,
        };
      }

      return {
        ok: false,
        status: "pending",
        note: "Kon pagina-titel niet parsen; handmatige review",
      };
    } catch (error) {
      if (bolId && urlOverlap.length >= 2) {
        return {
          ok: true,
          status: "ok",
          note: `Fetch faalde; Bol-ID + slug voldoende (${error instanceof Error ? error.message : "error"})`,
        };
      }
      return {
        ok: false,
        status: "pending",
        note: `Fetch faalde: ${error instanceof Error ? error.message : "onbekend"}`,
      };
    }
  }

  if (urlOverlap.length >= 2) {
    return {
      ok: true,
      status: "ok",
      note: `URL-slug match (${urlOverlap.join(", ")})`,
    };
  }

  return {
    ok: false,
    status: "pending",
    note: "Onvoldoende bewijs dat URL bij dit product hoort",
  };
}
