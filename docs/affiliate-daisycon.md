# Daisycon: Zendure NL en HomeWizard INT

Status per 16 juli 2026: publisher-account goedgekeurd, twee campagnes actief.
Dit document beschrijft de linkstructuur, wat er al klaarstaat in code en database,
welke waarden de eigenaar nog uit het Daisycon-dashboard moet kopiëren, en hoe de
dagelijkse productfeed-ingest gaat werken (vervolg-PR).

## Goedgekeurde campagnes

| Campagne | Program ID (si) | Netwerk | Commissie (bron) | Cookie |
|---|---|---|---|---|
| Zendure NL | 20779 | Daisycon | tot 8% CPS ([zendure.nl](https://www.zendure.nl/pages/affiliate-program)) | 30 dagen |
| HomeWizard INT | 18407 | Daisycon | 7,5% CPS ([affiliate-net.nl](https://affiliate-net.nl/programmas/homewizard/)) | 30 dagen |

De exacte staffels staan in MyDaisycon per campagne onder Vergoedingen; percentages
hierboven komen uit publieke bronnen en dienen als indicatie voor admin/analytics.

## Linkstructuur (officieel)

Bron: [Daisycon publisher FAQ](https://faq-publisher.daisycon.com/hc/nl/articles/204787042-Hoe-is-een-Daisycon-affiliate-deep-link-opgebouwd)

```
https://ds1.nl/c/?si=<campagne-id>&li=<link-id>&wi=<media-id>&ws=<subid>&dl=<url-encoded pad>
```

- `si`: campagne-ID (20779 of 18407).
- `li`: link-ID, per campagne, alleen zichtbaar in het publisher-dashboard. **Ontbreekt nog.**
- `wi`: ons media-ID: `423132` (env `DAISYCON_MEDIA_ID`).
- `ws`: Sub ID; wij vullen hier per klik `click_ref` in voor reconciliatie met `offer_clicks`.
- `dl`: alleen het pad na de domeinnaam van de adverteerder, url-encoded.

Helper in code: `buildDaisyconDeeplink` in `src/lib/affiliate/daisycon.ts`. De outbound
redirect (`/api/go/[offerId]`) vult `{click_ref}` al in via `offers.affiliate_params`
(`{"ws":"{click_ref}"}`, zie merchants-seed).

## Wat al klaarstaat

- `partner_programs`: rijen `zendure-nl` (program_id 20779) en `homewizard-int`
  (program_id 18407), netwerk `daisycon`, plus nieuwe kolom `link_id`
  (migratie `0017_daisycon_partner_links.sql`).
- `merchants`: `zendure` (zendure.nl) en `homewizard` (homewizard.com) met
  `default_affiliate_network = daisycon` en `deeplink_param_template = {"ws":"{click_ref}"}`.
- Env: `DAISYCON_MEDIA_ID` (Zod-schema `src/lib/env/server.ts`).
- Er zijn bewust nog GEEN offers omgezet naar ds1.nl-links: zonder geldig `li` komt een
  ds1.nl-link niet bij de juiste merchantpagina uit (getest; hij valt terug op een
  algemene shoppingpagina). Dat schendt de P0-regel voor outbound.

## Wat de eigenaar moet aanleveren (eenmalig, ca. 3 minuten)

1. Log in op [my.daisycon.com](https://my.daisycon.com).
2. Ga naar **Materiaal → Deeplinks**.
3. Plak als bestemming `https://zendure.nl/` en kies campagne **Zendure (NL)** en
   media **423132**. Kies output **URL**.
4. Kopieer uit de gegenereerde URL de waarde achter `li=` (alleen het nummer) en post
   die in Slack als: `Zendure li = <nummer>`.
5. Herhaal stap 3 en 4 met `https://www.homewizard.com/` en campagne
   **HomeWizard (INT)**: `HomeWizard li = <nummer>`.
6. Optioneel voor de feed-ingest: ga naar **Materiaal → Productfeeds**, selecteer per
   campagne media 423132, kies JSON, en plak de twee gegenereerde feed-URLs in Slack.

Daarna zet de data-agent `partner_programs.link_id`, bouwt de ds1.nl-deeplinks voor de
Zendure- en HomeWizard-offers, verifieert elke redirect met curl en zet ze live.

## Productfeed-ingest (vervolg-PR, na feed-URLs)

Feedstructuur: [daisycon.io/datafeed](https://daisycon.com/en/developers/productfeeds/building-a-url/)
met `program_id`, `media_id=423132`, `standard_id`, `language_code=nl`, `locale_id=1`,
`type=json`. Handmatige test op 16 juli 2026 gaf HTTP 204 (leeg): de feed-URL moet
eerst via het dashboard gegenereerd worden met de juiste standard.

Geplande werking (dagelijks, in de bestaande data-prices morning run):

1. Feed ophalen per campagne (JSON), parsen naar kandidaat-offers.
2. **EAN-matching** op `products.ean`; fallback op genormaliseerde titel-tokens
   (zelfde regels als Catalog Discovery). Geen match: kandidaat naar
   `catalog_candidates` voor review, nooit blind publiceren.
3. **Prijsupdate binnen 10%** automarge: direct bijwerken met bron-URL en checked-at,
   append naar `price_history` (nooit herschrijven).
4. **Afwijking groter dan 10%** of nieuw product: Slack 🔒 gate met PR-URL
   (`price-fact-verification`).
5. Deeplink per feed-item via `buildDaisyconDeeplink` en verificatie met curl
   (redirect moet op de juiste productpagina uitkomen) vóór `affiliate_link_status = ok`.
