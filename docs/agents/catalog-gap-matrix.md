# Catalogus gap-matrix (live inventaris)

Publieke productiecontrole op 2026-07-22 om 06:06 UTC. De automationomgeving heeft geen
Supabase serviceconfiguratie. Databasebrede aantallen, discovery candidates en drafts zijn daarom
niet als nul gerapporteerd.

## Completeness per marquee-merk

De publieke catalogus toont 17 gepubliceerde plug-in producten en voor alle 17 een unieke
productafbeelding. De kolom na patch bevat de brongebaseerde correcties in seed 0032 en 0033.

| Merk | Publiek gepubliceerd | Publieke bruikbare CTA | Na patch | Open gap |
|------|---------------------:|-----------------------:|---------:|----------|
| Zendure | 2 | 1 | 2 producten, 1 CTA | Hyper 2000 mist nog een affiliate deeplink |
| EcoFlow | 2 | 1 | 2 producten, 1 CTA | PowerStream wordt vervangen door STREAM Ultra |
| Anker SOLIX | 3 | 2 | 3 producten, 2 CTA's | E1600 AC mist nog een geverifieerde offer |
| Marstek | 2 | 1 | 2 producten, 1 CTA | Jupiter C wordt gecorrigeerd naar Jupiter C Plus |
| Growatt | 2 | 0 | 2 producten, 1 CTA | Wallbox offer is direct en nog niet betaald |
| Sessy | 2 | 2 | 2 producten, 2 CTA's | Deeplinks ontbreken |
| HomeWizard | 2 | 2 | 2 producten, 2 CTA's | Geen catalogusgap |
| Sunology | 2 | 2 | STOREY plus Extension, 2 CTA's | PLAY is een zonnepaneelset en gaat terug naar draft |

Na uitvoering van de patches halen alle marquee-merken minimaal twee gepubliceerde producten met
afbeelding en minimaal één bruikbare outbound offer.

## SKU en draftstatus

- Sunology PLAY is de enige bekende draft na de correctie. De huidige URL opent een PLAY2
  zonnepaneelset en mag niet als batterij gepubliceerd blijven.
- De databasequeue voor overige drafts en `needs_review` was niet bereikbaar.
- Bronbevestigde discovery vervangt verouderde records door EcoFlow STREAM Ultra, Marstek Jupiter
  C Plus en de Zendure Hyper 2000 set met AB2000X.
- Growatt NOAH 2000 krijgt een exacte Nederlandse productpagina. De eerder gevonden Bol pagina is
  afgewezen omdat deze niet leverbaar is en een afwijkende merknaam toont.

## Prijscontrole 2026-07-22

| Product | Vorige prijs | Bronprijs | Actie |
|---------|-------------:|----------:|-------|
| Anker SOLIX Solarbank Max AC | EUR 2.199 | EUR 2.099 | Automatisch bijgewerkt, verschil 4,5% |
| Zendure SolarFlow 800 plus AB2000L | EUR 747 | EUR 748 | Automatisch bijgewerkt, verschil 0,1% |
| Marstek Venus 5,12 kWh | EUR 1.300 | EUR 1.300 | Ongewijzigd |
| HomeWizard Plug-In Battery | EUR 1.195 | EUR 1.195 | Ongewijzigd |
| Sessy 5 kWh | EUR 3.550 | EUR 3.550 | Ongewijzigd |
| Sunology STOREY Master | EUR 2.499 | EUR 1.390 | Correctie in seed 0032 |

EcoFlow STREAM AC Pro is niet bijgewerkt. De directe Bol pagina gaf geen stabiele prijsrespons en
zoekresultaten varieerden van EUR 749 tot EUR 779. Anker E1600 Pro gaf eveneens geen stabiele
directe merchantrespons.

## P0 outbound en affiliate

- De 11 publieke CTA's bevatten geen zichtbare zoek- of listing-URL. De databasebrede P0 SQL scan
  kon zonder Supabase serviceconfiguratie niet worden uitgevoerd.
- EcoFlow Awin blijft pending totdat `AWIN_PUBLISHER_ID` beschikbaar is.
- Growatt NOAH 2000, Sessy single plus Duo en Sunology STOREY plus Extension hebben directe
  productlinks zonder affiliate deeplink. Plak deeplink zodra netwerk open is.
- Bol Marketing Catalog, Bol productfeed en Bol Partner API zijn niet geconfigureerd in deze
  automationomgeving.

## Doel

Minimaal twee gepubliceerde producten per marquee-merk met afbeelding en minimaal één
geverifieerde product-URL. Zoekpagina's, homepages en SKU-mismatches tellen nooit mee.
