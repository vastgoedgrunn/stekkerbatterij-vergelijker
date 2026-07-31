# Catalogus gap-matrix (live inventaris)

Publieke productiecontrole op 2026-07-31 om 06:02 UTC. De automationomgeving heeft geen
Supabase serviceconfiguratie. Drafts en discovery candidates zijn niet zichtbaar onder de
publieke RLS en worden daarom niet als nul gerapporteerd.

## Completeness per marquee-merk

De publieke catalogus toont 17 gepubliceerde plug-in producten. Alle 17 hebben een `image_path`.
Een merk is compleet bij minimaal twee gepubliceerde producten met afbeelding en minimaal één
offer met status `ok` en een concrete HTTPS-productlink.

| Merk | Gepubliceerd | Met afbeelding | Bruikbare outbound | Open gap |
|------|--------------:|---------------:|--------------------:|----------|
| Zendure | 2 | 2 | 1 | Hyper 2000 heeft geen actieve offer |
| EcoFlow | 2 | 2 | 1 | PowerStream 800 heeft geen actieve offer |
| Anker SOLIX | 3 | 3 | 2 | E1600 zonder Pro heeft geen actieve offer |
| Marstek | 2 | 2 | 1 | Jupiter C 10.24 heeft geen actieve offer |
| Growatt | 2 | 2 | 0 | NOAH 2000 en NOAH 2000S hebben geen actieve offer |
| Sessy | 2 | 2 | 2 | Beide offers missen een affiliate deeplink |
| HomeWizard | 2 | 2 | 2 | Geen catalogusgap |
| Sunology | 2 | 2 | 2 in code, 1 hard gematcht | PLAY verwijst naar een zonnestation en is geen batterij-SKU |

Growatt is het enige merk dat de completeness-eis niet haalt. Er zijn geen SKU-aantalgaten.

## SKU en draftstatus

- Zes gepubliceerde producten hebben geen actieve offer: Zendure Hyper 2000, EcoFlow PowerStream
  800, Anker E1600 zonder Pro, Marstek Jupiter C 10.24, Growatt NOAH 2000 en Growatt NOAH 2000S.
- Sunology PLAY is een SKU-mismatch. De product-URL toont een zonnestation in plaats van een
  batterijproduct.
- De afgeschermde databasequeue voor overige drafts en `needs_review` is niet bereikbaar.
- Klaar voor brongebaseerde beoordeling: Growatt NOAH 2000 met een offer van EUR 749, Sunology
  VAULT voor EUR 429 en STOREY Extension voor EUR 1190.

## Prijscontrole 2026-07-31

| Product | Productieprijs | Bronprijs | Actie |
|---------|---------------:|----------:|-------|
| Anker SOLIX Solarbank Max AC | EUR 2.199 | EUR 2.099 | Automatisch bijgewerkt, verschil 4,5 procent |
| Zendure SolarFlow 800 plus AB2000L | EUR 747 | EUR 747 | Controletijdstip vernieuwd |
| HomeWizard Plug-In Battery | EUR 1.195 | EUR 1.195 | Controletijdstip vernieuwd |
| HomeWizard bundle | EUR 2.390 | EUR 2.390 | Controletijdstip vernieuwd |
| Sessy 5 kWh | EUR 3.550 | EUR 3.550 | Controletijdstip vernieuwd |
| Sessy Duo | EUR 7.100 | Geen harde configuratiematch | Niet gewijzigd |
| EcoFlow STREAM AC Pro, merkshop | EUR 698 | EUR 799 | Verschil 14,5 procent, niet automatisch gewijzigd |
| Sunology STOREY Master | EUR 2.499 | EUR 1.390 | Verschil 44,4 procent, niet automatisch gewijzigd |
| Marstek Venus E 3.0 | EUR 1.300 | Tegenstrijdig zoekresultaat | Niet gewijzigd zonder eenduidige merchantbron |

Bronnen zijn op 2026-07-31 om 06:04 UTC gecontroleerd:

- Anker Max AC:
  <https://www.bol.com/nl/nl/p/anker-solix-solarbank-max-ac-balkonkrachtwerk-met-opslag-7kwh-3600w-alles-in-1-plug-play-thuisaccu-10000-cycli-5-min-installatie-zonnepaneel-met-omvormer/9300000292343906/>
- EcoFlow STREAM AC Pro: <https://nl.ecoflow.com/products/stream-ac-pro-ac>
- Zendure SolarFlow 800: <https://www.zendure.nl/products/solarflow-800>
- HomeWizard Plug-In Battery: <https://www.homewizard.com/nl/shop/plug-in-battery/>
- Sessy: <https://www.sessy.nl/product/sessy/>
- Sunology STOREY: <https://sunology.eu/products/storey-batterie-stockage-plug-play>

## P0 outbound en affiliate

- De code-equivalente zoek- en listingcontrole geeft `P0 search-URL count: 0`.
- Sunology PLAY is één semantische SKU-mismatch en blijft een P0-blokker.
- Vijf actieve offers missen een `affiliate_deeplink`: Sessy single, Sessy Duo, Sunology PLAY,
  Sunology STOREY en de pending EcoFlow merkshop-offer.
- Voor ieder ontbrekend netwerk geldt: plak deeplink zodra netwerk open is.
- EcoFlow Awin blijft pending totdat `AWIN_PUBLISHER_ID` beschikbaar is.
- Bol Catalog, Bol productfeed en Bol Partner API zijn niet geconfigureerd in deze
  automationomgeving.

## Doel

Minimaal twee gepubliceerde plug-inproducten per marquee-merk met afbeelding en minimaal één
hard gematchte productlink. Zoekpagina's, homepages en SKU-mismatches tellen nooit mee.
