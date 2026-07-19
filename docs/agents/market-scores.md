# Externe marktscores

Citeerbare aggregates (Trustpilot, Amazon, Trustindex) per product. Geen neppe
reviewteksten. UI toont **Marktscore (productscore/merkscore)** met bronlink.

## Velden (`products`)

| Kolom | Betekenis |
|---|---|
| `market_score_average` | 0 tot 5 (genormaliseerd) |
| `market_score_count` | Aantal reviews achter de score |
| `market_score_source_name` | Bijv. Trustpilot, Amazon.de |
| `market_score_source_url` | Citeerbare URL |
| `market_score_scope` | `sku` of `brand` |
| `market_score_checked_at` | Verificatiedatum |

Site-reviews (`reviews` + `product_rating_stats`) blijven leidend wanneer aanwezig.
JSON-LD AggregateRating gebruikt **alleen** site-reviews.

## Seed

`db/seed/0019_product_market_scores.sql` (snapshot 2026-07-19).
Tesla Powerwall en BYD Battery-Box bewust leeg: Trustpilot op tesla.com/byd.com is
vooral auto/service, geen betrouwbare batterijscore.
