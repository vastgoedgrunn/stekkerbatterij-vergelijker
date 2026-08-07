# Catalogus gap-matrix (live inventaris)

Publieke productiecontrole op 2026-08-07 om 06:01 UTC. De automationomgeving heeft geen
Supabase serviceconfiguratie. Drafts en discovery candidates zijn niet zichtbaar onder de
publieke RLS en worden daarom niet als nul gerapporteerd.

## Completeness per marquee-merk

De publieke catalogus toont 17 gepubliceerde plug-inproducten. Alle 17 hebben een `image_path`.
Een merk is compleet bij minimaal twee gepubliceerde producten met afbeelding en minimaal één
offer met status `ok` en een concrete HTTPS-productlink.

| Merk | Gepubliceerd | Met afbeelding | Bruikbare outbound | Open gap |
|------|--------------:|---------------:|--------------------:|----------|
| Zendure | 2 | 2 | 1 | Hyper 2000 heeft geen actieve offer |
| EcoFlow | 2 | 2 | 1 | PowerStream 800 heeft geen actieve offer |
| Anker SOLIX | 3 | 3 | 2 | E1600 zonder Pro heeft geen actieve offer |
| Marstek | 2 | 2 | 1 | Jupiter C 10.24 heeft geen actieve offer |
| Growatt | 2 | 2 | 0 | NOAH 2000 mist een offer en NOAH 2000S mist een harde SKU-bron |
| Sessy | 2 | 2 | 2 | Beide offers missen een affiliate deeplink |
| HomeWizard | 2 | 2 | 2 | Geen catalogusgap |
| Sunology | 2 | 2 | 2 in productie, 1 hard gematcht | PLAY is een zonnestation en gaat terug naar draft |

Na toepassing van seeds `0033` en `0034` toont de catalogus 16 geldige plug-inproducten.
Growatt blijft op twee producten door NOAH 2000S te vervangen door de bronmatig bevestigde
NEXA 2000. NOAH 2000 en NEXA 2000 krijgen beide een exacte Nederlandse productlink.
Sunology houdt één geldig batterijproduct en heeft daardoor nog één SKU-gat.

## SKU en draftstatus

- Na de correcties hebben vier gepubliceerde producten geen actieve offer: Zendure Hyper 2000,
  EcoFlow PowerStream 800, Anker E1600 zonder Pro en Marstek Jupiter C 10.24.
- Sunology PLAY blijft bewust draft omdat de bron een zonnestation toont, geen batterij-SKU.
- Growatt NOAH 2000S blijft bewust draft omdat geen harde SKU-bron is gevonden.
- Growatt NEXA 2000 vervangt de onjuiste tweede Growatt-rij en wordt met afbeelding, prijs en
  twee bevestigde SKU-identifiers gepubliceerd.
- De afgeschermde databasequeue voor overige drafts en `needs_review` is niet bereikbaar.
  De publieke nulmeting is daarom geen bewijs dat deze queue leeg is.
- De zeven producten uit `0013_top_models_draft.sql` staan publiek, maar PLAY en NOAH 2000S
  worden door de correctieseeds teruggezet naar draft. Er is geen ander verifieerbaar
  seed-draft dat nog op publicatie wacht.

## Prijscontrole 2026-08-07

| Product | Productieprijs | Bronprijs | Actie |
|---------|---------------:|----------:|-------|
| Anker SOLIX Solarbank Max AC | EUR 2.199 | EUR 2.099 | In seed bijgewerkt, verschil 4,5 procent |
| Zendure SolarFlow 800 plus AB2000L | EUR 747 | EUR 747 | Controletijdstip vernieuwd naar 7 augustus |
| HomeWizard Plug-In Battery | EUR 1.195 | EUR 1.195 | Controletijdstip vernieuwd naar 7 augustus |
| HomeWizard bundle | EUR 2.390 | EUR 2.390 | Controletijdstip vernieuwd naar 7 augustus |
| Sessy 5 kWh | EUR 3.550 | EUR 3.550 | Controletijdstip vernieuwd naar 7 augustus |
| Sessy Duo | EUR 7.100 | Geen harde configuratiematch | Niet gewijzigd |
| EcoFlow STREAM AC Pro, Bol | EUR 698 | Niet actueel verifieerbaar | Niet gewijzigd zonder Bol Catalog |
| EcoFlow STREAM AC Pro, merkshop | EUR 698 | EUR 749 | Automatisch bijgewerkt, verschil 7,3 procent |
| Sunology STOREY Master | EUR 2.499 | EUR 1.390 | Automatisch bijgewerkt |
| Marstek Venus E 3.0 | EUR 1.300 | Laatst bevestigd EUR 1.300 | Niet gewijzigd zonder actuele Bol-bron |
| Growatt NOAH 2000 | Geen offer | EUR 603,79 | Nieuwe exacte merchantoffer toegevoegd |
| Growatt NEXA 2000 | Niet gepubliceerd | EUR 545 | Nieuw product en exacte merchantoffer toegevoegd |
| Sunology PLAY | EUR 1.299 | EUR 599 voor een zonnestation | Offer verwijderd wegens SKU-mismatch |

De merchantprijzen zijn op 2026-08-07 om 06:05 UTC gecontroleerd. De Bol-productpagina van
Anker Max AC was voor het laatst hard bevestigd op 2026-07-31 om 06:04 UTC:

- Anker Max AC:
  <https://www.bol.com/nl/nl/p/anker-solix-solarbank-max-ac-balkonkrachtwerk-met-opslag-7kwh-3600w-alles-in-1-plug-play-thuisaccu-10000-cycli-5-min-installatie-zonnepaneel-met-omvormer/9300000292343906/>
- EcoFlow STREAM AC Pro: <https://nl.ecoflow.com/products/stream-ac-pro-ac>
- Zendure SolarFlow 800: <https://www.zendure.nl/products/solarflow-800>
- HomeWizard Plug-In Battery: <https://www.homewizard.com/nl/shop/plug-in-battery/>
- Sessy: <https://www.sessy.nl/prijsinformatie/>
- Sunology STOREY: <https://sunology.eu/products/storey-batterie-stockage-plug-play>
- Sunology PLAY: <https://sunology.eu/products/play-kit-solaire-plug-play>
- Growatt NEXA 2000: <https://www.stralendgroen.nl/product/growatt-nexa-2000/>
- Growatt NOAH 2000:
  <https://uwsolarinstallatieshop.nl/Thuisbatterijen/580-growatt-noah-2000.html>
- Marstek Venus E 3.0:
  <https://www.bol.com/nl/nl/p/marstek-venus-e-3-0-5-12kwh-plug-play-thuisbatterij-via-230v-stopcontact/9300000240523865/>

## P0 outbound en affiliate

- De code-equivalente zoek- en listingcontrole geeft `P0 search-URL count: 0`.
- Sunology PLAY en Growatt NOAH 2000S zijn semantische SKU-problemen. De correctieseeds zetten
  beide producten terug naar draft en verwijderen eventuele offers.
- Na de correcties missen zes actieve offers een `affiliate_deeplink`: Sessy single, Sessy Duo,
  Sunology STOREY, EcoFlow STREAM AC Pro bij EcoFlow, Growatt NOAH 2000 en Growatt NEXA 2000.
- Sessy single, Sessy Duo, Sunology STOREY, Growatt NOAH 2000 en Growatt NEXA 2000:
  plak deeplink zodra netwerk open is.
- EcoFlow STREAM AC Pro bij EcoFlow blijft pending: plak deeplink zodra Awin open is.
- EcoFlow Awin blijft pending totdat `AWIN_PUBLISHER_ID` beschikbaar is.
- Bol Catalog, Bol productfeed en Bol Partner API zijn niet geconfigureerd in deze
  automationomgeving.

## Doel

Minimaal twee gepubliceerde plug-inproducten per marquee-merk met afbeelding en minimaal één
hard gematchte productlink. Zoekpagina's, homepages en SKU-mismatches tellen nooit mee.
