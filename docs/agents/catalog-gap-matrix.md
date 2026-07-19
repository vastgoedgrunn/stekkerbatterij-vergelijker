# Catalog gap matrix (outbound)

Snapshot **2026-07-19** na P0 cleanup (`0024_catalog_outbound_cleanup.sql`).

Regel: published SKU heeft óf een `affiliate_link_status=ok` product-URL, óf **geen** shop-CTA.

## Met geverifieerde outbound (8)

| Slug | Merchant | Prijs | Bron |
|------|----------|-------|------|
| anker-solix-solarbank-2-e1600-pro | bol | €699 | Bol Catalog + partner deeplink |
| ecoflow-stream-ac-pro | bol | €698 | Bol Catalog + partner deeplink |
| marstek-venus-512 | bol | €1300 | Bol Venus E 3.0 5,12kWh (pid 9300000240523865) |
| zendure-solarflow-800 | zendure | €747 | Daisycon glp8 (li=1881195) |
| homewizard-plug-in-battery | homewizard | €1195 | Officiële shop (Daisycon `li` volgt) |
| sessy-thuisbatterij | sessy | €3550 | Officiële sessy.nl |
| sunology-play | sunology | €599 | Officiële sunology.eu |
| sunology-storey | sunology | €1390 | Officiële sunology.eu |

## Zonder outbound (bewust, tot geverifieerde URL)

| Slug | Reden |
|------|-------|
| anker-solix-solarbank-2-e1600 | Bol toont alleen E1600 **Pro**; geen aparte non-Pro URL |
| ecoflow-powerstream-800 | Solar Sale dood; Bol alleen accessoires/kabels |
| growatt-noah-2000 / 2000s | Bol heeft NEXA/AURA, geen NOAH-match |
| homewizard-plug-in-battery-bundle | Geen aparte geverifieerde product-URL |
| marstek-jupiter-c-1024 | Geen betrouwbare Bol/merchant productmatch |
| sessy-thuisbatterij-duo | Geen aparte duo-product-URL geverifieerd |
| zendure-solarflow-hyper-2000 | Bol product bestaat, geen best offer (geen voorraad) |

## Owner follow-ups

1. Daisycon HomeWizard: post `HomeWizard li = …` → dan tracking-deeplink i.p.v. kale shop-URL.
2. Coolblue/Awin: alleen echte product-IDs na titelcheck (nooit placeholders).
3. Hyper 2000: opnieuw Bol best-offer checken wanneer op voorraad.
