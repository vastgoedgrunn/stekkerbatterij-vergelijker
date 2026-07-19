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
- [ ] Geen broken interne links (CI broken-link check)

## Na publicatie

- [ ] Vercel preview: title/OG steekproef (1 PDP + 1 gids)
- [ ] Plausible: organisch verkeer zichtbaar in `/admin/analytics` wanneer API-key gezet is
