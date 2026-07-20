# Affiliate-aanmelding: stappen voor eigenaar

Zodra programma's zijn goedgekeurd, zet je **publisher-ID's** en **voorbeeld-deeplinks**
in Vercel (of Slack). Agents vullen seeds/admin en testen outbound.

## Live nu

| Programma | Netwerk | Wat staat er |
|-----------|---------|--------------|
| Bol Partner | Bol | Site-ID `1532194`, Marketing Catalog API live |
| Zendure NL | Daisycon | `si=20779`, `li=1881195`, `wi=423133` |
| HomeWizard INT | Daisycon | `si=18407`, `li=1795784`, `wi=423133` |

## Prioriteit (wacht op goedkeuring)

| # | Programma | Verwacht | Actie na goedkeuring |
|---|-----------|----------|----------------------|
| 1 | **EcoFlow NL (Awin)** mid `123332` | ~5% CPS | `AWIN_PUBLISHER_ID` in Vercel + product-deeplink |
| 2 | **e-WNDR** leads | ~€100 CPA | `EWNDR_LEAD_AFFILIATE_URL` (echte offerte-URL) |
| 3 | **Daisycon energie** Frank / Vattenfall | CPA | `program_id` per campagne → `energy_partners` |
| 4 | **Coolblue Energie** Awin `85163` | CPA leads | Alleen als je vaste-batterij/energie promoot |
| 5 | **Coolblue NL** Awin `85161` | CPS | Alleen met echte `/product/{id}`-URL’s |
| 6 | **Anker SOLIX EU** | CPS | Impact/EU-programma naast Bol |

## Stappen per netwerk

### EcoFlow / Awin

1. Awin publisher-account + aansluiten op [EcoFlow NL](https://ui.awin.com/merchant-profile/123332).
2. Noteer **Publisher ID** (`awinaffid`).
3. Zet `AWIN_PUBLISHER_ID` in Vercel (Production + Preview).
4. Stuur 1 product-URL (bijv. STREAM AC Pro op `nl.ecoflow.com`).
5. Zie `docs/affiliate-awin.md`.

### Bol.com Partner

1. Account op [affiliate.bol.com](https://affiliate.bol.com/).
2. Site-ID in Vercel: `BOL_PUBLISHER_ID` (live: `1532194`).
3. Optioneel: Marketing Catalog `BOL_CLIENT_ID` / `BOL_CLIENT_SECRET` (live).

### Daisycon (Zendure + HomeWizard)

Live. Details: `docs/affiliate-daisycon.md`. Media `423133`.

### Daisycon (energie)

1. Aanmelden Frank Energie + Vattenfall FlexPrijs in MyDaisycon.
2. Noteer `program_id` per campagne.
3. Agents activeren `energy_partners` (nu `active=false` door placeholders).

### e-WNDR (vaste batterij-leads)

1. Affiliate via [e-wndr.nl/affiliate-worden](https://e-wndr.nl/affiliate-worden/).
2. Ontvang **consumer quote-URL** (niet de affiliate-worden-pagina).
3. Zet `EWNDR_LEAD_AFFILIATE_URL` in Vercel. CTA op vaste-PDP verschijnt dan automatisch.

## Na goedkeuring (agents)

1. Env in Vercel zetten (of ID in Slack/Cursor plakken).
2. Seed/admin: deeplink + `affiliate_link_status=ok` na URL-verify.
3. Test: klik → 302 → `offer_clicks` in `/admin/clicks`.

## Placeholders

- Frank/Vattenfall: `FRANK_PLACEHOLDER` / `VATTENFALL_PLACEHOLDER` (partners inactief).
- EcoFlow Awin-offer: `pending` tot `AWIN_PUBLISHER_ID` + product-URL.
- Coolblue/Gamma: geen zoek/listing-URL’s (P0 soft-delete in `0028_monetization_ready.sql`).
