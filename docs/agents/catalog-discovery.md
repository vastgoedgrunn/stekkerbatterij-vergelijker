# Catalog Discovery Engine

Dagelijkse autopilot die NL stekkerbatterijen ontdekt, SKU-matcht en alleen publiceert
met geverifieerde outbound-links.

## Code

- Pipeline: `src/features/catalog-discovery/run-pipeline.server.ts`
- Bol stub/feed: `src/features/catalog-discovery/bol-client.ts`
- Admin: `/admin/catalog` (Run discovery, review-queue, approve/reject)
- Migratie: `db/migrations/0013_catalog_discovery.sql`

## Env (Vercel)

| Variabele | Rol |
|-----------|-----|
| `BOL_PRODUCT_FEED_URL` | Productfeed JSON/CSV (primair) |
| `BOL_PARTNER_API_KEY` | Optionele Bearer voor feed/API |
| `BOL_PUBLISHER_ID` | Bouwt `partner.bol.com` deeplinks |

Zonder keys: research seeds + agent-research; zelfde SKU-match gate.

## Automation

Cron UTC `0 5 * * *` · prompt in `docs/agents/automations.md` §1.
