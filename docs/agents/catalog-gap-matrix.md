# Catalogus gap-matrix (live inventaris)

Snapshot Supabase `stekkerbatterij-vergelijker` (2026-07-19, na CRO blitz).

## Outbound-dekking plug-in (published)

| Status | SKUs |
|--------|------|
| Live outbound (≥1 ok offer) | Anker Pro, EcoFlow STREAM AC Pro, HomeWizard single, Marstek Venus, Sessy single, Sunology Play/Storey, Zendure 800 |
| Nieuw in seed `0025_*` | HomeWizard Bundle, Sessy Duo (officiële shop/product-URL) |
| Nog geen geverifieerde product-URL | Anker E1600 non-Pro, EcoFlow PowerStream 800, Growatt NOAH 2000/2000S, Marstek Jupiter, Zendure Hyper (NL shop: out of stock) |

## Blokkers (owner)

1. **HomeWizard Daisycon `li`**: post `HomeWizard li = <id>` zodat CPS (~7,5%) live kan i.p.v. alleen official shop.
2. **`EWNDR_LEAD_AFFILIATE_URL`**: echte offerte-URL in Vercel (nu fallback homepage).
3. **Energy Daisycon**: Frank/Vattenfall placeholders vervangen zodra campaign IDs er zijn.
4. **Coolblue/Awin + Impact Anker**: publisher IDs + product-URL’s vóór re-activate.

## Doel

2–4 published plug-in SKUs per marquee-merk mét geverifieerde product-URL (geen search/homepage).

## Bronnen (recente checks)

- HomeWizard shop: https://www.homewizard.com/nl/shop/plug-in-battery/ (2026-07-19)
- Sessy product: https://www.sessy.nl/product/sessy/ (2026-07-19)
- Zendure Hyper NL: https://www.zendure.nl/products/solarflow-hyper-2000 (varianten `available: false`, 2026-07-19)
