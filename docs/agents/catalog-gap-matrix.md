# Catalogus gap-matrix (live inventaris)

Snapshot van Supabase project `stekkerbatterij-vergelijker` (2026-07-15).
Doel (plan): **2–4 published plug-and-play SKUs per marquee-merk**, met image, omschrijving, ≥1 offer, affiliate hybrid.

## Marquee-merken vs published count

| Merk | Published | Doel min. | Gap (SKU) | Notes |
|------|-----------|-----------|-----------|-------|
| Anker SOLIX | 1 | 2 | +1 | Solarbank 2 E1600 OK; deeplinks deels aanwezig |
| EcoFlow | 1 | 2 | +1 | PowerStream 800 OK |
| Growatt | 1 | 2 | +1 | NOAH 2000 OK |
| HomeWizard | 1 | 2 | +1 | Plug-In Battery OK |
| Marstek | 2 | 2 | 0 | Venus + Jupiter; Jupiter mist echte product-deeplink |
| Sessy | 1 | 2 | +1 | Thuisbatterij OK |
| Sunology | 1 | 2 | +1 | Storey: bol-offer zonder product-URL/deeplink |
| Zendure | 1 | 2 | +1 | SolarFlow 800 OK |

**Totaal published:** 9 · **Minimum om claim te halen:** +7 SKUs (naar ≥16).

## Offer / affiliate health (samenvatting)

- Veel bol-offers hebben al `partner.bol.com` deeplinks (publisher `s=1532194`); netwerk-goedkeuring kan alsnog open staan.
- Coolblue/Gamma/Zonneplan/Solar Sale: vaak merchant-URL als deeplink (Awin/Daisycon placeholders tot netwerk live).
- Stekkerbatterij Shop-offers: geen affiliate_url (eigen shop / empty).
- P0 missing product-URL: `sunology-storey` bol → alleen `https://www.bol.com`; `marstek-jupiter-c-1024` Solar Sale → alleen homepage.

## Content completeness (bestaande 9)

Alle published producten hebben: image_path, summary, description, capacity/power. Geen content-gat op bestaande SKUs; gat is vooral **diepte per merk** + **affiliate-URL kwaliteit**.

## Actie voor Data-agent / Fase 1

1. Per merk met gap: 1 extra NL-relevante stekkerbatterij researchen (bron + prijs + beeld).
2. Nieuwe SKUs eerst als `draft` of via Slack 🔒 approve, daarna `published`.
3. Broken/pending deeplinks markeren (`affiliate_link_status`) en Slack P0 tot Bol/Awin/Daisycon live.
