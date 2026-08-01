# Catalogus gap-matrix (live inventaris)

Publieke productiecontrole op 2026-08-01 om 06:03 UTC. De automationomgeving heeft geen
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
| Sunology | 2 | 2 | 2 in productie, 1 hard gematcht | PLAY gaat terug naar draft omdat de URL een zonnestation toont |

De live productiecontrole toont geen SKU-aantalgaten. Na toepassing van de correctie in
`0033_sunology_play_sku_mismatch.sql` heeft Sunology één geldig gepubliceerd batterijproduct en
dus één SKU-gat. Growatt mist bij beide producten een bruikbare outbound offer.

## SKU en draftstatus

- Zes gepubliceerde producten hebben geen actieve offer: Zendure Hyper 2000, EcoFlow PowerStream
  800, Anker E1600 zonder Pro, Marstek Jupiter C 10.24, Growatt NOAH 2000 en Growatt NOAH 2000S.
- Sunology PLAY is een SKU-mismatch. Seed `0033` zet het product terug naar draft en verwijdert
  de actieve offer zodra de seed op de database is toegepast.
- De afgeschermde databasequeue voor overige drafts en `needs_review` is niet bereikbaar.
- De zeven producten uit `0013_top_models_draft.sql` zijn inmiddels allemaal publiek
  gepubliceerd. Er is daarom geen verifieerbaar seed-draft dat nog wacht.
- Nieuwe, nog niet gepubliceerde voorstellen zijn Growatt NOAH 2000 met een offer van EUR 749,
  Sunology VAULT voor EUR 429 en STOREY Extension voor EUR 1190. Deze zijn geen bevestigde
  databasedrafts zolang de afgeschermde queue niet kan worden gelezen.

## Prijscontrole 2026-08-01

| Product | Productieprijs | Bronprijs | Actie |
|---------|---------------:|----------:|-------|
| Anker SOLIX Solarbank Max AC | EUR 2.199 | EUR 2.099 | In seed bijgewerkt, verschil 4,5 procent |
| Zendure SolarFlow 800 plus AB2000L | EUR 747 | EUR 747 | Controletijdstip vernieuwd |
| HomeWizard Plug-In Battery | EUR 1.195 | EUR 1.195 | Controletijdstip vernieuwd |
| HomeWizard bundle | EUR 2.390 | EUR 2.390 | Controletijdstip vernieuwd |
| Sessy 5 kWh | EUR 3.550 | EUR 3.550 | Controletijdstip vernieuwd |
| Sessy Duo | EUR 7.100 | Geen harde configuratiematch | Niet gewijzigd |
| EcoFlow STREAM AC Pro, Bol | EUR 698 | EUR 779 | Verschil 11,6 procent, niet automatisch gewijzigd |
| EcoFlow STREAM AC Pro, merkshop | EUR 698 | EUR 799 | Verschil 14,5 procent, niet automatisch gewijzigd |
| Sunology STOREY Master | EUR 2.499 | EUR 1.390 | Verschil 44,4 procent, niet automatisch gewijzigd |
| Marstek Venus E 3.0 | EUR 1.300 | EUR 1.300 | Controletijdstip vernieuwd |
| Sunology PLAY | EUR 1.299 | EUR 599 voor een zonnestation | Offer verwijderd wegens SKU-mismatch |

Bronnen zijn op 2026-08-01 om 06:03 UTC gecontroleerd. De Bol productpagina van Anker Max AC
was voor het laatst hard bevestigd op 2026-07-31 om 06:04 UTC:

- Anker Max AC:
  <https://www.bol.com/nl/nl/p/anker-solix-solarbank-max-ac-balkonkrachtwerk-met-opslag-7kwh-3600w-alles-in-1-plug-play-thuisaccu-10000-cycli-5-min-installatie-zonnepaneel-met-omvormer/9300000292343906/>
- EcoFlow STREAM AC Pro: <https://nl.ecoflow.com/products/stream-ac-pro-ac>
- Zendure SolarFlow 800: <https://www.zendure.nl/products/solarflow-800>
- HomeWizard Plug-In Battery: <https://www.homewizard.com/nl/shop/plug-in-battery/>
- Sessy: <https://www.sessy.nl/product/sessy/>
- Sunology STOREY: <https://sunology.eu/products/storey-batterie-stockage-plug-play>
- Sunology PLAY: <https://sunology.eu/products/sunology-play>
- Marstek Venus E 3.0:
  <https://www.bol.com/nl/nl/p/marstek-venus-e-3-0-5-12kwh-plug-play-thuisbatterij-via-230v-stopcontact/9300000240523865/>

## P0 outbound en affiliate

- De code-equivalente zoek- en listingcontrole geeft `P0 search-URL count: 0`.
- Sunology PLAY is één semantische SKU-mismatch. Seed `0033` verwijdert de offer en zet het
  product terug naar draft. De productiecorrectie wacht op toepassing van de seed.
- Vijf live offers missen een `affiliate_deeplink`: Sessy single, Sessy Duo, Sunology PLAY,
  Sunology STOREY en de pending EcoFlow merkshop-offer. Na de PLAY-correctie blijven er vier.
- Voor ieder ontbrekend netwerk geldt: plak deeplink zodra netwerk open is.
- EcoFlow Awin blijft pending totdat `AWIN_PUBLISHER_ID` beschikbaar is.
- Bol Catalog, Bol productfeed en Bol Partner API zijn niet geconfigureerd in deze
  automationomgeving.

## Doel

Minimaal twee gepubliceerde plug-inproducten per marquee-merk met afbeelding en minimaal één
hard gematchte productlink. Zoekpagina's, homepages en SKU-mismatches tellen nooit mee.
