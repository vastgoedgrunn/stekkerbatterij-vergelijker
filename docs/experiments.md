# A/B-experimenten

Lichte, zelfgebouwde testinfrastructuur zonder externe tool. De code leeft in
`src/lib/experiments/`.

## Hoe het werkt

1. De proxy (`src/proxy.ts`) zet bij de eerste request een first-party cookie
   `sbv_ab_id` (anoniem UUID, 1 jaar, SameSite=Lax).
2. De variant wordt deterministisch bepaald: hash(visitorId + experimentId)
   modulo de som van de gewichten. Dezelfde bezoeker krijgt dus altijd dezelfde
   variant, zonder database of externe opslag.
3. Componenten lezen de variant client-side via `useExperiment(experimentId)`.
   De server rendert altijd de controlevariant, zodat statische/ISR-pagina's
   statisch blijven en er geen hydration mismatch is. Testbezoekers zien hooguit
   een minimale copy-swap na hydration.
4. Zonder cookie (geblokkeerd), tijdens SSR of bij een gepauzeerd experiment
   geldt altijd de controlevariant.

## Een experiment toevoegen

1. Voeg het experiment toe aan de registry in
   `src/lib/experiments/experiments.ts`: id, beschrijving, status `active`,
   startdatum en varianten met gewichten. De variant `control` is verplicht en
   moet gelijk zijn aan wat de server nu al rendert.
2. Maak (of hergebruik) een klein client component voor het stukje UI dat
   verschilt en roep daarin `useExperiment("<id>")` aan. Voorbeeld:
   `src/features/experiments/hero-cta.tsx`.
3. Houd de wijziging klein: alleen het element dat getest wordt hoort in het
   client component, de rest van de pagina blijft een server component.

## Meten in Plausible

- Exposure: het event `experiment_viewed` vuurt een keer per pageview per
  experiment, met props `experiment` en `variant`.
- Conversie: `trackEvent` voegt aan alle conversie-events (zoals
  `offer_clicked` en `decision_wizard_completed`) automatisch de actieve
  varianten toe als props in de vorm `exp_<experimentId>: <variant>`.
- Vergelijken per variant: open in Plausible het conversie-event (bijvoorbeeld
  `offer_clicked`) en filter of breek uit op de property `exp_hero_cta_copy`.
  Vergelijk de conversie per variant tegen het aantal `experiment_viewed`
  events met dezelfde variant.

## Een experiment afronden

Winnaars worden hard-coded: zet de winnende copy of variant direct in het
component, verwijder de `useExperiment`-aanroep als die niet meer nodig is en
haal het experiment uit de registry. De registry bevat dus alleen lopende
experimenten. Zet `status: "paused"` alleen tijdelijk, bijvoorbeeld tijdens een
onderzoek naar rare resultaten; iedereen ziet dan control.

## Lopende experimenten

| Experiment | Start | Varianten | Waar |
| --- | --- | --- | --- |
| `hero_cta_copy` | 2026-07-16 | `control` ("Start de beslishulp") vs `snelle_belofte` ("Vind jouw batterij in 1 minuut"), 50/50 | Homepage hero, `src/features/experiments/hero-cta.tsx` |
