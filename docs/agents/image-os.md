# Image OS: automatische productfoto’s

Doel: elke published productkaart toont een **juiste, bruikbare** batterijfoto, of een nette
placeholder. De owner zoekt of finetunet geen foto’s.

## Statusvelden (`products`)

| Kolom | Betekenis |
|---|---|
| `image_status` | `ok` \| `pending` \| `rejected` \| `broken` |
| `image_source_url` | Bron van de goedgekeurde of laatst geprobeerde foto |
| `image_checked_at` | Laatste check |
| `image_reject_reason` | Waarom niet ok (agent-digest) |
| `image_content_hash` | SHA-256; voorkomt gedeelde foto tussen SKUs |

UI ([`ProductImage`](../src/features/products/product-image.tsx)) toont alleen bij `image_status=ok`.
Publish ([`publishProductIfReady`](../src/features/catalog-discovery/publish.server.ts)) vereist hetzelfde.

## Pipeline (`repairProductImage`)

1. Daisycon JSON-feed op EAN (als `DAISYCON_MEDIA_ID` + program_id)
2. Bol-feed op EAN (als `BOL_PRODUCT_FEED_URL`)
3. Curated fabrikant-URL ([`product-image-sources.ts`](../src/features/catalog-discovery/product-image-sources.ts))
4. Offer-productpagina → JSON-LD / og:image
5. Lokale `/images/products/{slug}.*` als die publiek bestaat
6. Heuristics (grootte, content-type, geen logo/badge-URL)
7. Vision-gate via Vercel AI Gateway (`openai/gpt-5.4`), subject moet `battery` zijn
8. Optioneel: remove.bg cutout als `REMOVE_BG_API_KEY` gezet is
9. Ingest naar Supabase Storage `products/catalog/{slug}.*`

Admin: **Vernieuw productfoto’s** → `repairProductImages({ force: true })`.

Data-agent morning run: Image OS repair + digest (repaired / pending / broken).

## Env

- AI Gateway: OIDC op Vercel of `AI_GATEWAY_API_KEY` (lokaal via `vercel env pull`)
- Optioneel: `REMOVE_BG_API_KEY` voor automatische achtergrond-verwijdering
- `DAISYCON_MEDIA_ID`, `BOL_PRODUCT_FEED_URL` voor feed-bronnen

## Migratie / seed

- Schema: `db/migrations/0018_product_image_status.sql`
- AlphaESS: `db/seed/0019_alphaess_fixed_batteries.sql` (draft + pending tot Image OS `ok`, daarna publish)
