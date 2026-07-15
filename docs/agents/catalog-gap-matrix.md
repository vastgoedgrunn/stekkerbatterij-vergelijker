# Catalogus gap-matrix (live inventaris)

Snapshot van Supabase project `stekkerbatterij-vergelijker` (2026-07-15).
Doel (plan): **2–4 published plug-and-play SKUs per marquee-merk**, met image, omschrijving, ≥1 offer, affiliate hybrid.

## Marquee-merken vs counts

| Merk | Published | Draft klaar | Doel min. | Notes |
|------|-----------|-------------|-----------|-------|
| Anker SOLIX | 1 | +1 Pro | 2 | Solarbank 2 E1600 OK; deeplinks deels aanwezig |
| EcoFlow | 1 | +1 STREAM AC Pro | 2 | PowerStream 800 OK |
| Growatt | 1 | +1 NOAH 2000S | 2 | NOAH 2000 OK |
| HomeWizard | 1 | +1 Bundle | 2 | Plug-In Battery OK |
| Marstek | 2 | 0 | 2 | Venus + Jupiter; Jupiter product-URL gefixt/pending |
| Sessy | 1 | +1 Duo | 2 | Thuisbatterij OK |
| Sunology | 1 | +1 PLAY | 2 | Storey bol-URL gefixt/pending |
| Zendure | 1 | +1 Hyper 2000 | 2 | SolarFlow 800 OK |

**Totaal published:** 9 · Na publish van drafts: ≥16 (claim ≥2 per merk).

## Draft SKUs (wacht op Slack 🔒 approve om te publiceren)

| Slug | Merk |
|------|------|
| `zendure-solarflow-hyper-2000` | Zendure |
| `ecoflow-stream-ac-pro` | EcoFlow |
| `anker-solix-solarbank-2-e1600-pro` | Anker SOLIX |
| `growatt-noah-2000s` | Growatt |
| `sunology-play` | Sunology |
| `sessy-thuisbatterij-duo` | Sessy |
| `homewizard-plug-in-battery-bundle` | HomeWizard |

Seed: [`db/seed/0013_top_models_draft.sql`](../../db/seed/0013_top_models_draft.sql).

Na approve:

```sql
update products
set status = 'published', published_at = now()
where status = 'draft'
  and slug in (
    'zendure-solarflow-hyper-2000',
    'ecoflow-stream-ac-pro',
    'anker-solix-solarbank-2-e1600-pro',
    'growatt-noah-2000s',
    'sunology-play',
    'sessy-thuisbatterij-duo',
    'homewizard-plug-in-battery-bundle'
  );
```

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
