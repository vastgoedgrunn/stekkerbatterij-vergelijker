# Affiliate-aanmelding — stappen voor eigenaar

Zodra deze programma's zijn goedgekeurd, lever je de **publisher-ID's** en **deeplink-sjablonen**
aan (Slack of admin). Wij vullen ze in via admin/seed en testen elke outbound link.

## Prioriteit (winst × snelheid)

| # | Programma | Verwachte commissie | Aanmeld-URL | Wat we van jou nodig hebben |
|---|-----------|---------------------|-------------|----------------------------|
| 1 | **Zendure NL** | ~8% CPS, 30d cookie | [zendure.nl/pages/affiliate-program](https://www.zendure.nl/pages/affiliate-program) | Awin/Impact publisher-ID, deeplink-sjabloon per product |
| 2 | **Anker SOLIX EU** | ~8% CPS, 30d cookie | [ankersolix.com/eu/become-an-affiliate](https://www.ankersolix.com/eu/become-an-affiliate) | Publisher-ID, product-deeplinks |
| 3 | **Bol.com Partner** | 2,5–7% per categorie | [affiliate.bol.com](https://affiliate.bol.com/) | Site-ID (`s=…` in deeplink), Bol API-key (optioneel) |
| 4 | **Daisycon** | Frank €30–60, Vattenfall €4–96 CPA | [daisycon.com/nl](https://www.daisycon.com/nl/) | Publisher-ID, campaign-IDs per energiepartner |
| 5 | **e-WNDR** (leads) | ~€100 CPA per thuisbatterij-lead | [e-wndr.nl/affiliate-worden](https://e-wndr.nl/affiliate-worden/) | Affiliate-link voor lead-formulier |

## Stappen per netwerk

### Zendure / Awin

1. Meld je aan via Zendure of direct bij [Awin](https://www.awin.com/).
2. Wacht op goedkeuring (1–5 werkdagen).
3. Noteer: **Publisher ID**, **Advertiser ID** (Zendure), voorbeeld-deeplink uit het dashboard.
4. Stuur ons 1 voorbeeld-URL per hero-product (SolarFlow 800).

### Anker SOLIX EU

1. Aanmelden via [Anker SOLIX affiliate-pagina](https://www.ankersolix.com/eu/become-an-affiliate).
2. Vaak via Impact Radius — noteer publisher-ID.
3. Deeplink naar Solarbank 2 E1600 (Bol/Coolblue/Gamma).

### Bol.com Partner

1. Account op [affiliate.bol.com](https://affiliate.bol.com/) — site moet live zijn.
2. Genereer deeplink per product via partner-tools.
3. Vervang `PUBLISHER_ID` in seed/admin door jouw `s=…` waarde.
4. *(Optioneel)* Bol Product API voor automatische prijs-sync.

### Daisycon (energie)

1. Publisher-account op [daisycon.com](https://www.daisycon.com/nl/).
2. Meld je aan voor **Frank Energie** en **Vattenfall FlexPrijs**.
3. Noteer **program_id** per campagne → wij zetten die in `energy_partners.affiliate_url`.
4. Test subid-tracking: `subid={click_ref}`.

### e-WNDR (vaste batterij-leads)

1. Affiliate aanvragen via [e-wndr.nl/affiliate-worden](https://e-wndr.nl/affiliate-worden/).
2. Ontvang tracking-URL voor lead-formulier.
3. Wij koppelen die in `LeadPanel` zodra goedgekeurd.

## Na goedkeuring

1. Stuur IDs + 1 test-deeplink per netwerk naar Slack.
2. Data-agent vult admin in (via verification gate voor commissie-%).
3. QA test: klik → redirect → `offer_clicks.click_ref` in `/admin/clicks`.
4. Geen commissie-% live zonder bron-URL in `commission_source_url`.

## Placeholders in seed

Tot jouw IDs binnen zijn staan in `db/seed/seed.sql`:

- `PUBLISHER_ID` in Bol-deeplinks
- `FRANK_PLACEHOLDER` / `VATTENFALL_PLACEHOLDER` in energie-URLs

Vervang deze vóór productie-traffic.
