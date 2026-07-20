# Daisycon: Zendure NL en HomeWizard INT

Status per 20 juli 2026: Zendure NL én HomeWizard INT live (li + media + offers).

## Goedgekeurde campagnes

| Campagne | Program ID (si) | Link ID (li) | Media (wi) | Tracking-host | Status |
|---|---|---|---|---|---|
| Zendure NL | 20779 | **1881195** | **423133** | glp8.net | Live |
| HomeWizard INT | 18407 | **1795784** | **423133** | partner.homewizard.com | Live |

Commissie (indicatie): Zendure tot 8% CPS ([zendure.nl](https://www.zendure.nl/pages/affiliate-program)),
HomeWizard 7,5% CPS ([affiliate-net.nl](https://affiliate-net.nl/programmas/homewizard/)). Cookie 30 dagen.
Exacte staffels staan in MyDaisycon per campagne onder Vergoedingen.

## Linkstructuur (officieel)

Bron: [Daisycon publisher FAQ](https://faq-publisher.daisycon.com/hc/nl/articles/204787042-Hoe-is-een-Daisycon-affiliate-deep-link-opgebouwd)

```
https://<tracking-host>/c/?si=<campagne-id>&li=<link-id>&wi=<media-id>&ws=<subid>&dl=<url-encoded pad>
```

- Tracking-host: meestal `glp8.net`; HomeWizard gebruikt `partner.homewizard.com`.
- `si`: campagne-ID (20779 of 18407).
- `li`: link-ID per campagne uit Materiaal → Deeplinks.
- `wi`: media-ID `423133` (env `DAISYCON_MEDIA_ID`).
- `ws`: Sub ID; wij vullen `{click_ref}` via `offers.affiliate_params`.
- `dl`: pad na de domeinnaam van de adverteerder, url-encoded.
  Homepage gebruiken om `li` te genereren is goed; productpaden zetten we zelf in `dl`.

Helper: `buildDaisyconDeeplink` in `src/lib/affiliate/daisycon.ts`.

## Live: Zendure SolarFlow 800

- Offer: `zendure-solarflow-800` × merchant `zendure`.
- Deeplink: `si=20779&li=1881195&wi=423133&dl=products/solarflow-800`.
- Seed: `db/seed/0018_zendure_daisycon_live.sql`.

## Live: HomeWizard Plug-In Battery (+ Bundle)

- `li=1795784` (gegenereerd 2026-07-20, media 423133).
- Single: `dl=nl/plug-in-battery/` → https://www.homewizard.com/nl/plug-in-battery/
- Bundle: `dl=nl/shop/plug-in-battery/` → https://www.homewizard.com/nl/shop/plug-in-battery/
- Seed: `db/seed/0027_homewizard_daisycon_live.sql`.

## Env (Vercel)

Zet `DAISYCON_MEDIA_ID=423133` in Production (+ Preview indien gewenst).

## Productfeed-ingest (vervolg)

Feedstructuur: [daisycon.io/datafeed](https://daisycon.com/en/developers/productfeeds/building-a-url/)
met `program_id`, `media_id=423133`, JSON.
