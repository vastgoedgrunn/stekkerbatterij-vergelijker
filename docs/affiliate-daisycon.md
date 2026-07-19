# Daisycon: Zendure NL en HomeWizard INT

Status per 19 juli 2026: Zendure NL live (li + media + offer). HomeWizard wacht nog op li.

## Goedgekeurde campagnes

| Campagne | Program ID (si) | Link ID (li) | Media (wi) | Status |
|---|---|---|---|---|
| Zendure NL | 20779 | **1881195** | **423133** | Live |
| HomeWizard INT | 18407 | ontbreekt | 423133 | Wacht op li |

Commissie (indicatie): Zendure tot 8% CPS ([zendure.nl](https://www.zendure.nl/pages/affiliate-program)),
HomeWizard 7,5% CPS ([affiliate-net.nl](https://affiliate-net.nl/programmas/homewizard/)). Cookie 30 dagen.
Exacte staffels staan in MyDaisycon per campagne onder Vergoedingen.

## Linkstructuur (officieel)

Bron: [Daisycon publisher FAQ](https://faq-publisher.daisycon.com/hc/nl/articles/204787042-Hoe-is-een-Daisycon-affiliate-deep-link-opgebouwd)

```
https://glp8.net/c/?si=<campagne-id>&li=<link-id>&wi=<media-id>&ws=<subid>&dl=<url-encoded pad>
```

Daisycon genereert `glp8.net`; `ds1.nl` redirect nog door naar hetzelfde.

- `si`: campagne-ID (20779 of 18407).
- `li`: link-ID per campagne uit Materiaal → Deeplinks.
- `wi`: media-ID `423133` (env `DAISYCON_MEDIA_ID`).
- `ws`: Sub ID; wij vullen `{click_ref}` via `offers.affiliate_params`.
- `dl`: pad na de domeinnaam van de adverteerder, url-encoded.

Helper: `buildDaisyconDeeplink` in `src/lib/affiliate/daisycon.ts`.

## Live: Zendure SolarFlow 800

- Offer: `zendure-solarflow-800` × merchant `zendure`.
- Prijs: €747 (variant SolarFlow 800 + AB2000L, 1,92 kWh).
- Bron: [zendure.nl/products/solarflow-800](https://www.zendure.nl/products/solarflow-800) (gechecked 2026-07-19).
- Deeplink: `si=20779&li=1881195&wi=423133&dl=products/solarflow-800`.
- Outbound geverifieerd met curl: redirect naar productpagina, `affiliate_link_status = ok`.
- Seed: `db/seed/0018_zendure_daisycon_live.sql`.

## Wat de eigenaar nog moet doen (HomeWizard)

1. Materiaal → Deeplinks, bestemming `https://www.homewizard.com/`, campagne HomeWizard (INT), media **423133**, output **URL**.
2. Post: `HomeWizard li = <nummer>`.
3. Optioneel: Materiaal → Productfeeds, media 423133, JSON, feed-URLs plakken voor dagelijkse ingest.

## Env (Vercel)

Zet `DAISYCON_MEDIA_ID=423133` in Production (+ Preview indien gewenst).

## Productfeed-ingest (vervolg-PR)

Feedstructuur: [daisycon.io/datafeed](https://daisycon.com/en/developers/productfeeds/building-a-url/)
met `program_id`, `media_id=423133`, JSON. Zendure-feed toont 240 producten in het dashboard.
