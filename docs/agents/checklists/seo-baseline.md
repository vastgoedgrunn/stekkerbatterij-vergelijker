# SEO baseline checklist (Content & SEO)

Gebruik bij elke content/SEO-PR. Geen keyword-stuffing, geen fake AggregateRating.

## Per pagina

- [ ] Unieke title (template `%s | Stekkerbatterij Vergelijker`)
- [ ] Unieke meta description (natuurlijk Nederlands, geen em/en-dashes)
- [ ] Canonical (`alternates.canonical`)
- [ ] Open Graph: title, description, url; product/gids: eigen `images`
- [ ] Twitter card `summary_large_image` waar relevant
- [ ] Interne links naar catalogus / beslishulp / gerelateerde gidsen

## Structured data

- [ ] Home: Organization (+ logo) + WebSite SearchAction
- [ ] PDP: Product + Breadcrumb (+ FAQ alleen bij echte FAQs; AggregateRating alleen bij echte reviews)
- [ ] Gids: Article met `image`, `datePublished`, `dateModified` + Breadcrumb
- [ ] Lijstpagina's (beste-* / merken): ItemList waar van toepassing

## Technisch

- [ ] Pagina in `src/app/sitemap.ts` of bewuste uitsluiting (bv. `/vergelijken` query-driven)
- [ ] `/admin`, `/account`, `/api` blijven noindex via robots/metadata
- [ ] Afbeeldingen: productfoto of gidscover, niet alleen site-wide OG fallback
- [ ] Favicon/merk: stabiele `/favicon.ico` + vierkant logo-mark in Organization JSON-LD
- [ ] Geen broken interne links (CI broken-link check)

## SERP / CTR

- [ ] Title: keyword eerst, ~50 tot 60 tekens, natuurlijk Nederlands
- [ ] Description: voordeel + CTA, ~140 tot 160 tekens (geen em/en-dashes)
- [ ] Google kan titel herschrijven; meet CTR in Search Console

## Na publicatie

- [ ] Vercel preview: title/OG/favicon steekproef (1 PDP + 1 gids + home)
- [ ] Search Console: URL-inspectie home (favicon kan dagen tot weken duren)
- [ ] Plausible: organisch verkeer zichtbaar in `/admin/analytics` wanneer API-key gezet is
