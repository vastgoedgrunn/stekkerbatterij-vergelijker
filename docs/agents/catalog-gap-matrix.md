# Catalogus gap-matrix (live inventaris)

Snapshot van Supabase project `stekkerbatterij-vergelijker`.
Doel (plan): **2–4 published plug-and-play SKUs per marquee-merk**, met image, omschrijving, ≥1 offer, affiliate hybrid.

## Marquee-merken vs counts

| Merk | Published | Draft klaar | Doel min. |
|------|-----------|-------------|-----------|
| Anker SOLIX | 1 | +1 Pro | 2 |
| EcoFlow | 1 | +1 STREAM AC Pro | 2 |
| Growatt | 1 | +1 NOAH 2000S | 2 |
| HomeWizard | 1 | +1 Bundle | 2 |
| Marstek | 2 | 0 | 2 |
| Sessy | 1 | +1 Duo | 2 |
| Sunology | 1 | +1 PLAY | 2 |
| Zendure | 1 | +1 Hyper 2000 | 2 |

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

## Affiliate hybrid

- Offers op drafts: `affiliate_link_status = pending` tot Bol/Awin/Daisycon live.
- Generieke bol/merchant homepages gemarkeerd pending met notitie.
- Admin: `/admin/catalog` + productdetail linkstatus.

## Bronnen (ter verificatie bij publish)

- EcoFlow STREAM / stekkerbatterij markt: https://www.p1meter.nl/intersolar-2026-stekker-thuisbatterij-verslag/
- Plug-and-play overzicht: https://allesoververduurzamen.nl/beste-thuisbatterij-met-stekker/
- Prijzen op offers zijn **indicatief** tot merchant-pagina + netwerk-deeplink geverifieerd zijn.
