# Catalogus gap-matrix (live inventaris)

Snapshot en code-status 2026-08-01.

## Outbound-dekking plug-in (published)

| Status | SKUs |
|--------|------|
| Betaald live | Anker Max AC (Bol), Anker Pro (Bol), EcoFlow STREAM (Bol), Marstek Venus (Bol), Zendure 800 (Daisycon), HomeWizard single (Daisycon) |
| Direct product-URL (onbetaald) | Sessy single, Sunology STOREY |
| Pending Awin | EcoFlow merkshop (`pending` tot `AWIN_PUBLISHER_ID`) |
| Nog geen geverifieerde product-URL | Anker E1600 non-Pro, EcoFlow PowerStream 800, Growatt NOAH, HomeWizard bundle, Marstek Jupiter, Sessy Duo, Sunology PLAY, Zendure Hyper (OOS) |

## Compleetheid marquee-merken

Alle 17 gepubliceerde stekkerbatterijen hebben een productfoto. Alleen Anker haalt het minimum
van twee gepubliceerde producten met een hard gematchte, bruikbare outbound.

| Merk | Gepubliceerd | Bruikbare outbound | Tekort |
|------|---------------|---------------------|--------|
| Anker SOLIX | 3 | 2 | 0 |
| EcoFlow | 2 | 1 | 1 |
| Growatt | 2 | 0 | 2 |
| HomeWizard | 2 | 1 | 1 |
| Marstek | 2 | 1 | 1 |
| Sessy | 2 | 1 | 1 |
| Sunology | 2 | 1 | 1 |
| Zendure | 2 | 1 | 1 |

## Needs review

1. **Sunology PLAY**: onze titel is een batterijproduct, maar de merchantpagina beschrijft een
   plug-in zonnepaneelset. Deze outbound mag niet als juiste batterij-SKU tellen.
2. **Sessy Thuisbatterij Duo**: onze prijs is 7.100 euro. De merchantpagina noemt 5 kWh voor
   3.550 euro en 10 kWh voor 5.500 euro, zonder aparte Duo-SKU.
3. **HomeWizard Plug-In Battery Bundle**: de deeplink opent de losse Plug-In Battery zonder
   vooraf geselecteerde bundel van twee.
4. **Sunology STOREY**: onze prijs is 2.499 euro en de fabrikant noemt 1.390 euro. De afwijking
   is groter dan 10%, dus niet automatisch bijgewerkt in deze run.

## Blokkers (wacht op goedkeuring / env)

1. **`AWIN_PUBLISHER_ID`**: EcoFlow NL mid `123332` live zetten.
2. **`EWNDR_LEAD_AFFILIATE_URL`**: echte offerte-URL (CTA verborgen tot gezet).
3. **Energy Daisycon**: Frank/Vattenfall `program_id` (partners nu `active=false`).
4. **Coolblue/Gamma product-URL’s**: alleen joinen/reactiveren met echte productdetailpagina’s.

## Doel

2–4 published plug-in SKUs per marquee-merk mét geverifieerde product-URL (geen search/homepage)
én bij voorkeur betaalde deeplink.
