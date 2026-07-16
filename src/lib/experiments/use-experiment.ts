"use client";

import { useEffect, useSyncExternalStore } from "react";
import { trackEvent } from "@/lib/observability/analytics";
import { assignVariant, readVisitorId } from "./assignment";
import { experiments, type ExperimentId, type ExperimentVariant } from "./experiments";

/** De cookie verandert niet tijdens een sessie, dus er is niets te subscriben. */
function subscribeNoop(): () => void {
  return () => {};
}

/**
 * Dedupliceert exposure-events: een experiment meldt zich hooguit een keer per
 * pageview, ook bij re-renders of meerdere componenten met hetzelfde
 * experiment. Bij unmount (client-side navigatie) wordt de entry gewist zodat
 * een volgende pageview opnieuw telt.
 */
const exposedExperiments = new Set<ExperimentId>();

/**
 * Leest de toegewezen variant voor een experiment uit de registry.
 *
 * Afweging (bewust): veel pagina's zijn statisch/ISR en mogen niet dynamic
 * worden voor een experiment. Daarom rendert de server altijd de
 * controlevariant en bepaalt deze hook de echte variant pas client-side via
 * useSyncExternalStore, op basis van de `sbv_ab_id` cookie. Geen hydration
 * mismatch en geen cache-schade; testbezoekers zien hooguit een minimale swap
 * van de copy direct na hydration.
 *
 * Fallbacks naar "control": tijdens SSR en hydration, zonder cookie
 * (geblokkeerd of proxy niet geraakt) en bij een gepauzeerd experiment.
 * Vuurt bij een actieve toewijzing precies een keer per pageview het
 * Plausible-event `experiment_viewed` af met props experiment en variant.
 */
export function useExperiment<T extends ExperimentId>(experimentId: T): ExperimentVariant<T> {
  const variant = useSyncExternalStore(
    subscribeNoop,
    () => {
      const visitorId = readVisitorId();
      return visitorId
        ? assignVariant(experimentId, visitorId)
        : ("control" as ExperimentVariant<T>);
    },
    () => "control" as ExperimentVariant<T>,
  );

  useEffect(() => {
    const visitorId = readVisitorId();
    if (!visitorId || experiments[experimentId].status !== "active") {
      return;
    }
    if (exposedExperiments.has(experimentId)) {
      return;
    }
    exposedExperiments.add(experimentId);
    trackEvent({
      name: "experiment_viewed",
      props: { experiment: experimentId, variant: assignVariant(experimentId, visitorId) },
    });
    return () => {
      exposedExperiments.delete(experimentId);
    };
  }, [experimentId]);

  return variant;
}
