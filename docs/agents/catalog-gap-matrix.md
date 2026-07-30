# Catalogus gap-matrix (live inventaris)

Publieke productiecontrole op 2026-07-30 om 06:02 UTC. De automationomgeving heeft geen
Supabase serviceconfiguratie. Databasebrede aantallen, discovery candidates en drafts zijn daarom
niet als nul gerapporteerd.

## Completeness per marquee-merk

De publieke catalogus toont 17 gepubliceerde plug-in producten. Alle 17 hebben een `image_path`.
De kolom na patch bevat de brongebaseerde correcties in seed 0032 en 0033.

| Merk | Publiek gepubliceerd | Publieke bruikbare CTA | Na patch | Open gap |
|------|---------------------:|-----------------------:|---------:|----------|
| Zendure | 2 | 1 | 2 producten, 1 CTA | Hyper 2000 is uitverkocht en mist een affiliate deeplink |
| EcoFlow | 2 | 1 | 2 producten, 1 CTA | PowerStream wordt vervangen door STREAM Ultra |
| Anker SOLIX | 3 | 2 | 3 producten, 2 CTA's | E1600 AC mist nog een geverifieerde offer |
| Marstek | 2 | 1 | 2 producten, 1 CTA | Jupiter C wordt gecorrigeerd naar Jupiter C Plus |
| Growatt | 2 | 0 | 2 producten, 1 CTA | Wallbox offer is direct en nog niet betaald |
| Sessy | 2 | 2 | 2 producten, 2 CTA's | Deeplinks ontbreken |
| HomeWizard | 2 | 2 | 2 producten, 2 CTA's | Geen catalogusgap |
| Sunology | 2 | 2 | STOREY plus VAULT, 2 plug-in CTA's | PLAY heeft geen geldige batterij-SKU en gaat terug naar draft |

Na uitvoering van de patches halen alle marquee-merken minimaal twee gepubliceerde producten met
afbeelding en minimaal één bruikbare outbound offer.

## SKU en draftstatus

- Sunology PLAY is de enige bekende draft na de correctie. De URL toont een zonnestation
  zonder overeenkomende batterij-SKU.
- De databasequeue voor overige drafts en `needs_review` was niet bereikbaar.
- Bronbevestigde discovery vervangt verouderde records door EcoFlow STREAM Ultra, Marstek Jupiter
  C Plus en de Zendure Hyper 2000 set met AB2000L. De Hyper set is nu uitverkocht en krijgt daarom
  geen prijs.
- Growatt NOAH 2000 krijgt een exacte Nederlandse productpagina. De eerder gevonden Bol pagina is
  afgewezen omdat deze niet leverbaar is en een afwijkende merknaam toont.

## Prijscontrole 2026-07-30

| Product | Vorige prijs | Bronprijs | Actie |
|---------|-------------:|----------:|-------|
| Anker SOLIX Solarbank Max AC | EUR 2.199 | EUR 2.099 | Automatisch bijgewerkt, verschil 4,5% |
| Anker SOLIX Solarbank 2 E1600 Pro | EUR 699 | EUR 699 | Ongewijzigd volgens exacte Bol productpagina |
| EcoFlow STREAM AC Pro, directe merkshop | EUR 698 | EUR 799 | Product-URL en prijs bijgewerkt, blijft pending zonder Awin-deeplink |
| Zendure SolarFlow 800 plus AB2000L | EUR 747 | EUR 747 | Ongewijzigd volgens Nederlandse merkshop |
| Growatt NOAH 2000 | Geen offer | EUR 749 | Exacte Nederlandse productoffer toegevoegd |
| Marstek Venus 5,12 kWh, Bol | EUR 1.300 | EUR 1.300 | Ongewijzigd volgens exacte Bol productpagina |
| HomeWizard Plug-In Battery | EUR 1.195 | EUR 1.195 | Ongewijzigd |
| Sessy 5 kWh | EUR 3.550 | EUR 3.550 | Ongewijzigd |
| Sunology STOREY Master | EUR 2.499 | EUR 1.390 | Correctie in seed 0032 |
| Sunology VAULT | Nieuw | EUR 429 | Exacte officiële productoffer toegevoegd |
| Sunology STOREY Extension | Nieuw | EUR 1.190 | Exacte SKU `STOREYEC2200P500` toegevoegd |

De EcoFlow merkshop toont STREAM AC Pro voor EUR 799. De aparte Bol offer bleef op EUR 698 omdat
Bol voor die offer geen eenduidige actuele prijs teruggaf.

Sessy toont nu ook een selectie van 10 kWh voor EUR 5.500. Deze prijs is niet op het bestaande
product Sessy Duo gezet, omdat de bron geen SKU of configuratie toont waarmee dezelfde uitvoering
hard kan worden vastgesteld.

## P0 outbound en affiliate

- De publieke RLS-weergave bevat 26 actieve offers. De code-equivalente scan gaf
  `P0 search-URL count: 0`.
- EcoFlow Awin blijft pending totdat `AWIN_PUBLISHER_ID` beschikbaar is.
- EcoFlow STREAM AC Pro bij EcoFlow, Growatt NOAH 2000 bij Wallbox Discounter, Sessy single plus
  Duo en Sunology STOREY, VAULT plus Extension hebben directe productlinks zonder affiliate deeplink.
  Plak deeplink zodra netwerk open is.
- Marstek Jupiter C, EcoFlow PowerStream 800, Zendure Hyper 2000, Growatt NOAH 2000 plus 2000S en
  Anker E1600 AC hebben in productie nog geen actieve offer.
- Bol Marketing Catalog, Bol productfeed en Bol Partner API zijn niet geconfigureerd in deze
  automationomgeving.

## Doel

Minimaal twee gepubliceerde producten per marquee-merk met afbeelding en minimaal één
geverifieerde product-URL. Zoekpagina's, homepages en SKU-mismatches tellen nooit mee.
