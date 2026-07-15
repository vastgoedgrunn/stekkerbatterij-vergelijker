# Catalog Discovery Engine

Dagelijkse autopilot die NL stekkerbatterijen ontdekt, SKU-matcht en alleen publiceert
met geverifieerde outbound-links.

## Code

- Pipeline: `src/features/catalog-discovery/run-pipeline.server.ts`
- Bol stub/feed: `src/features/catalog-discovery/bol-client.ts`
- Image ingest: `ingest-image.server.ts` + `refresh-product-images.server.ts`
  (download merchant/fabrikant-foto → Supabase Storage `products` / `catalog/{slug}.ext`)
- Admin: `/admin/catalog` (Run discovery, Vernieuw productfoto's, review-queue)
- Migraties: `0013_catalog_discovery.sql`, `0014_products_storage_bucket.sql`

## Env (Vercel)

| Variabele | Rol |
|-----------|-----|
| `BOL_PRODUCT_FEED_URL` | Productfeed JSON/CSV (primair) |
| `BOL_PARTNER_API_KEY` | Optionele Bearer voor feed/API |
| `BOL_PUBLISHER_ID` | Bouwt `partner.bol.com` deeplinks |

Zonder keys: research seeds + agent-research; zelfde SKU-match gate.

## Automation

Cron UTC `0 5 * * *` · prompt in `docs/agents/automations.md` §1.
