# Catalog Discovery Engine

Dagelijkse autopilot die NL stekkerbatterijen ontdekt, SKU-matcht en alleen publiceert
met geverifieerde outbound-links.

## Code

- Pipeline: `src/features/catalog-discovery/run-pipeline.server.ts`
- Bol Marketing Catalog + feed-fallback: `src/features/catalog-discovery/bol-client.ts`
- Bol prijsrefresh (full auto vanuit Catalog): `refresh-bol-prices.server.ts`
  (prijs + voorraad + productfoto via `include-image`; geldt voor alle Bol-offers,
  inclusief shop-accessoires)
- Image ingest: `ingest-image.server.ts` + `refresh-product-images.server.ts`
  (download merchant/fabrikant-foto → Supabase Storage `products` / `catalog/{slug}.ext`)
- Admin: `/admin/catalog` (Run discovery, Vernieuw Bol-prijzen, Vernieuw productfoto's, review-queue)
- Migraties: `0013_catalog_discovery.sql`, `0014_products_storage_bucket.sql`

## Env (Vercel)

| Variabele | Rol |
|-----------|-----|
| `BOL_CLIENT_ID` | Marketing Catalog OAuth client ID |
| `BOL_CLIENT_SECRET` | Marketing Catalog OAuth secret (één regel, geen newlines) |
| `BOL_PUBLISHER_ID` | Bouwt `partner.bol.com` deeplinks (`s=`) |
| `BOL_PRODUCT_FEED_URL` | Optionele productfeed JSON/CSV (legacy fallback) |
| `BOL_PARTNER_API_KEY` | Optionele Bearer voor feed |

Zonder keys: research seeds + agent-research; zelfde SKU-match gate.

## Automation

Cron UTC `0 5 * * *` · prompt in `docs/agents/automations.md` §1 · checklist in
`.cursor/rules/data-prices-agent.mdc` (Morning run). P0 scan:
`docs/agents/checklists/p0-outbound-scan.md`.
