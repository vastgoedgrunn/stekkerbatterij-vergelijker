# Catalogus gap-matrix (live inventaris)

Publieke productiecontrole op 2026-07-21 om 05:00 UTC.

## Completeness per marquee-merk

Alle merken hebben minimaal twee gepubliceerde producten met een afbeelding. Vier merken halen
nog niet de strengere eis van twee producten met een bruikbare outbound offer.

| Merk | Gepubliceerd | Met bruikbare outbound | Open gap |
|------|-------------:|-----------------------:|----------|
| Zendure | 2 | 1 | Hyper 2000 alleen als set met AB2000X aanbieden |
| EcoFlow | 2 | 1 | PowerStream vervangen door een echte STREAM batterij |
| Anker SOLIX | 3 | 2 | E1600 zonder Pro heeft nog geen geverifieerde productlink |
| Marstek | 2 | 1 | Jupiter C corrigeren naar Jupiter C Plus, basis 2,56 kWh |
| Growatt | 2 | 0 | NOAH 2000 en NOAH 2000S missen een bruikbare live offer |
| Sessy | 2 | 2 | Geen |
| HomeWizard | 2 | 2 | Geen |
| Sunology | 2 | 2 | Geen |

Totaal: 17 gepubliceerd, 17 met afbeelding en 11 met een bruikbare outbound CTA.

## Outbound-dekking

| Status | SKUs |
|--------|------|
| Betaald live | Anker Max AC, Anker Pro, EcoFlow STREAM AC Pro en Marstek Venus via Bol; Zendure SolarFlow 800 en HomeWizard single plus bundle via Daisycon |
| Direct product-URL | Sessy single plus Duo en Sunology PLAY plus STOREY |
| Geen bruikbare offer | Anker E1600, EcoFlow PowerStream 800, Growatt NOAH 2000 plus 2000S, Marstek Jupiter C en Zendure Hyper 2000 |

De publieke product-URL-scan vond nul zoek- of listing-URL's onder de 11 actieve CTA's. De
databasebrede P0-SQL kon in deze automationomgeving niet draaien omdat Supabase serviceconfiguratie
ontbrak.

## Integratiestatus

- Bol Marketing Catalog: niet geconfigureerd in de automationomgeving.
- Bol productfeed en Partner API: niet geconfigureerd in de automationomgeving.
- Research seeds: actief en bijgewerkt met exacte bronnen voor Growatt NOAH 2000, EcoFlow STREAM
  Ultra, Marstek Jupiter C Plus en Zendure Hyper 2000 plus AB2000X.
- `AWIN_PUBLISHER_ID`: EcoFlow merkshop blijft pending zolang deze variabele ontbreekt.
- Energy Daisycon: Frank en Vattenfall blijven inactief zonder geverifieerd `program_id`.
- Coolblue en Gamma: alleen activeren met een geverifieerde productdetailpagina.

## Doel

Minimaal twee gepubliceerde plug-in SKUs per marquee-merk met afbeelding, prijs en geverifieerde
product-URL. Zoekpagina's, homepages en SKU-mismatches tellen nooit mee.
