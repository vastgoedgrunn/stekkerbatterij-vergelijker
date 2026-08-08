# Catalogus gap-matrix (live inventaris)

Publieke productiecontrole op 2026-08-08 om 06:03 UTC. De automationomgeving heeft geen
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

Seeds `0033` en `0034` zijn op 7 augustus naar `main` gemerged, maar zijn aantoonbaar nog niet
op de productiedatabase toegepast. NEXA 2000 geeft publiek een 404, terwijl Sunology PLAY en
Growatt NOAH 2000S nog gepubliceerd zijn. Na toepassing toont de catalogus 16 geldige
plug-inproducten. Growatt blijft dan op twee producten door NOAH 2000S te vervangen door de
bronmatig bevestigde NEXA 2000. Sunology houdt één geldig batterijproduct en heeft daardoor
nog één SKU-gat.

## SKU en draftstatus

- Productie heeft zes gepubliceerde producten zonder actieve offer: Zendure Hyper 2000,
  EcoFlow PowerStream 800, Anker E1600 zonder Pro, Marstek Jupiter C 10.24, Growatt NOAH 2000
  en Growatt NOAH 2000S.
- Sunology PLAY hoort draft te zijn omdat de bron een zonnestation toont, geen batterij-SKU.
  De correctieseed is nog niet op productie toegepast.
- Growatt NOAH 2000S hoort draft te zijn omdat geen harde SKU-bron is gevonden. De
  correctieseed is nog niet op productie toegepast.
- Growatt NEXA 2000 vervangt de onjuiste tweede Growatt-rij zodra de correctieseed is toegepast.
  De huidige merchantpagina bevestigt SKU 229066 en MPN NEXA 2000, maar toont de hoofdprijs
  niet betrouwbaar in de uitgelezen pagina. De prijs blijft daarom op de laatst bevestigde
  EUR 545 met controledatum 7 augustus.
- De afgeschermde databasequeue voor overige drafts en `needs_review` is niet bereikbaar.
  De publieke nulmeting is daarom geen bewijs dat deze queue leeg is.
- De zeven producten uit `0013_top_models_draft.sql` staan publiek, maar PLAY en NOAH 2000S
  worden door de correctieseeds teruggezet naar draft. Er is geen ander verifieerbaar
  seed-draft dat nog op publicatie wacht.

## Prijscontrole 2026-08-08

| Product | Productieprijs | Bronprijs | Actie |
|---------|---------------:|----------:|-------|
| Anker SOLIX Solarbank Max AC | EUR 2.199 | EUR 2.099 | Seed bevestigd op 8 augustus, nog niet live |
| Zendure SolarFlow 800 plus AB2000L | EUR 747 | EUR 747 | Controletijdstip vernieuwd naar 8 augustus |
| HomeWizard Plug-In Battery | EUR 1.195 | EUR 1.195 | Controletijdstip vernieuwd naar 8 augustus |
| HomeWizard bundle | EUR 2.390 | EUR 2.390 | Afgeleid als twee bevestigde units |
| Sessy 5 kWh | EUR 3.550 | EUR 3.550 | Controletijdstip vernieuwd naar 8 augustus |
| Sessy Duo | EUR 7.100 | Geen harde configuratiematch | Niet gewijzigd |
| EcoFlow STREAM AC Pro, Bol | EUR 698 | Niet actueel verifieerbaar | Niet gewijzigd zonder Bol Catalog |
| EcoFlow STREAM AC Pro, merkshop | EUR 698 | EUR 749 | Seed bevestigd op 8 augustus, nog niet live |
| Sunology STOREY Master | EUR 2.499 | EUR 1.390 | Seed bevestigd op 8 augustus, nog niet live |
| Marstek Venus E 3.0 | EUR 1.300 | EUR 1.300 | Controletijdstip vernieuwd naar 8 augustus |
| Growatt NOAH 2000 | Geen offer | EUR 603,79 | Correctieseed bevestigd op 8 augustus, nog niet live |
| Growatt NEXA 2000 | Niet gepubliceerd | Laatst EUR 545 | Niet gewijzigd zonder actuele hoofdprijs |
| Sunology PLAY | EUR 1.299 | EUR 599 voor een zonnestation | Correctieseed nog niet live |

De merchantprijzen zijn op 2026-08-08 om 06:04 UTC gecontroleerd. De exacte Bol-productpagina's
bevestigen Anker Max AC op EUR 2.099 en Marstek Venus E 3.0 op EUR 1.300:

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

- De code-equivalente productiecontrole geeft `P0 search-URL count: 0`.
- Sunology PLAY en Growatt NOAH 2000S zijn nog live semantische SKU-problemen. De gemergede
  correctieseeds zetten beide producten terug naar draft en verwijderen eventuele offers,
  maar die databasewijzigingen zijn nog niet toegepast.
- Productie mist vijf `affiliate_deeplink` waarden. Sessy single bij Sessy: plak deeplink zodra
  netwerk open is. Sessy Duo bij Sessy: plak deeplink zodra netwerk open is. Sunology STOREY
  bij Sunology: plak deeplink zodra netwerk open is. EcoFlow STREAM AC Pro bij EcoFlow: plak
  deeplink zodra Awin open is. Sunology PLAY wordt verwijderd en krijgt geen deeplink.
- Na toepassing van de Growatt-correctie missen ook NOAH 2000 en NEXA 2000 een deeplink:
  plak deeplink zodra netwerk open is.
- EcoFlow Awin blijft pending totdat `AWIN_PUBLISHER_ID` beschikbaar is.
- Bol Catalog, Bol productfeed en Bol Partner API zijn niet geconfigureerd in deze
  automationomgeving.

## Doel

Minimaal twee gepubliceerde plug-inproducten per marquee-merk met afbeelding en minimaal één
hard gematchte productlink. Zoekpagina's, homepages en SKU-mismatches tellen nooit mee.
