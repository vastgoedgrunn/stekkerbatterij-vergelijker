# Catalogus gap-matrix (live inventaris)

Snapshot van Supabase project `stekkerbatterij-vergelijker` (2026-07-15).
Doel (plan): **2–4 published plug-and-play SKUs per marquee-merk**, met image, omschrijving, ≥1 offer, affiliate hybrid.

## Marquee-merken vs counts

| Merk | Published | Draft klaar | Doel min. | Notes |
|------|-----------|-------------|-----------|-------|
| Anker SOLIX | 2 | 0 | 2 | Solarbank 2 E1600 + Pro gepubliceerd |
| EcoFlow | 2 | 0 | 2 | PowerStream 800 + STREAM AC Pro gepubliceerd |
| Growatt | 2 | 0 | 2 | NOAH 2000 + NOAH 2000S gepubliceerd |
| HomeWizard | 2 | 0 | 2 | Plug-In Battery + Bundle gepubliceerd |
| Marstek | 2 | 0 | 2 | Venus + Jupiter; Jupiter product-URL gefixt/pending |
| Sessy | 2 | 0 | 2 | Thuisbatterij + Duo gepubliceerd |
| Sunology | 2 | 0 | 2 | Storey + PLAY gepubliceerd |
| Zendure | 2 | 0 | 2 | SolarFlow 800 + Hyper 2000 gepubliceerd |

**Totaal published:** 16 (2 per marquee-merk, claim "alle grote merken" gehaald).

## Top-model SKUs (gepubliceerd na Slack ✅ approve 2026-07-15)

| Slug | Merk |
|------|------|
| `zendure-solarflow-hyper-2000` | Zendure |
| `ecoflow-stream-ac-pro` | EcoFlow |
| `anker-solix-solarbank-2-e1600-pro` | Anker SOLIX |
| `growatt-noah-2000s` | Growatt |
| `sunology-play` | Sunology |
| `sessy-thuisbatterij-duo` | Sessy |
| `homewizard-plug-in-battery-bundle` | HomeWizard |

Seeds: [`db/seed/0013_top_models_draft.sql`](../../db/seed/0013_top_models_draft.sql) (insert als draft),
[`db/seed/0014_publish_top_models.sql`](../../db/seed/0014_publish_top_models.sql) (publish na approve).

Owner-approve via 1-klik ✅ in Slack op 2026-07-15; toegepast op productie-DB.
Prijzen/URLs blijven indicatief (`affiliate_link_status = pending`) tot Bol/Awin/Daisycon-deeplinks
geverifieerd zijn.

## Offer / affiliate health

- Offers op drafts: `affiliate_link_status = pending` tot Bol/Awin/Daisycon live.
- Veel bestaande bol-offers hebben al `partner.bol.com` deeplinks (publisher `s=1532194`); netwerk-goedkeuring kan alsnog open staan.
- Coolblue/Gamma/Zonneplan/Solar Sale: vaak merchant-URL als deeplink (placeholders tot netwerk live).
- Generieke bol/merchant homepages gemarkeerd pending met notitie.
- Admin: `/admin/catalog` + productdetail linkstatus.

## Content completeness (bestaande 9)

Alle published producten hebben: image_path, summary, description, capacity/power. Gat is vooral **diepte per merk** + **affiliate-URL kwaliteit**.

## Bronnen (ter verificatie bij publish)

- EcoFlow STREAM / stekkerbatterij markt: https://www.p1meter.nl/intersolar-2026-stekker-thuisbatterij-verslag/
- Plug-and-play overzicht: https://allesoververduurzamen.nl/beste-thuisbatterij-met-stekker/
- Prijzen op offers zijn **indicatief** tot merchant-pagina + netwerk-deeplink geverifieerd zijn.
