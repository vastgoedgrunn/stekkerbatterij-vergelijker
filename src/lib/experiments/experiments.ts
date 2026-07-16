/**
 * Lichte, zelfgebouwde A/B-testinfrastructuur (geen externe tool).
 *
 * Werking in het kort:
 * - De proxy (src/proxy.ts) zet een first-party cookie `sbv_ab_id` (1 jaar,
 *   SameSite=Lax) zodra een bezoeker binnenkomt.
 * - De variant wordt deterministisch bepaald: hash(visitorId + experimentId)
 *   modulo de som van de gewichten. Dezelfde bezoeker krijgt dus altijd
 *   dezelfde variant, zonder aparte opslag.
 * - Componenten lezen de variant client-side via `useExperiment` en tonen
 *   server-side altijd de controlevariant (zie use-experiment.ts voor de
 *   afweging rond flikkering en caching).
 *
 * Zie docs/experiments.md voor het toevoegen en afronden van experimenten.
 */

/** Naam van de first-party cookie met het anonieme bezoekers-id. */
export const AB_COOKIE_NAME = "sbv_ab_id";

/** Levensduur van de toewijzingscookie: 1 jaar. */
export const AB_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type ExperimentStatus = "active" | "paused";

export interface ExperimentDefinition {
  /** Korte omschrijving van de hypothese en wat er verschilt per variant. */
  description: string;
  /** Alleen "active" experimenten wijzen varianten toe; anders altijd control. */
  status: ExperimentStatus;
  /** Startdatum (ISO, JJJJ-MM-DD) voor context bij het aflezen van resultaten. */
  startedAt: string;
  /**
   * Variantnaam naar relatief gewicht. De variant "control" is verplicht en is
   * tevens de server-side fallback (SSR rendert altijd control).
   */
  variants: Readonly<{ control: number } & Record<string, number>>;
}

/**
 * Registry van alle experimenten. Voeg hier een experiment toe en gebruik het
 * daarna type-safe via `useExperiment("<id>")`. Winnaars worden hard-coded in
 * de UI en het experiment verdwijnt daarna weer uit deze registry.
 */
export const experiments = {
  hero_cta_copy: {
    description:
      "Homepage hero CTA: control 'Start de beslishulp' tegenover de scherpere belofte 'Vind jouw batterij in 1 minuut'.",
    status: "active",
    startedAt: "2026-07-16",
    variants: { control: 50, snelle_belofte: 50 },
  },
} as const satisfies Record<string, ExperimentDefinition>;

/** Alle geldige experiment-ids uit de registry. */
export type ExperimentId = keyof typeof experiments;

/** Alle geldige variantnamen voor een specifiek experiment. */
export type ExperimentVariant<T extends ExperimentId> = keyof (typeof experiments)[T]["variants"] &
  string;
