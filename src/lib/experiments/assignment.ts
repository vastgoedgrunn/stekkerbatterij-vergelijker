import {
  AB_COOKIE_NAME,
  experiments,
  type ExperimentId,
  type ExperimentVariant,
} from "./experiments";

/** FNV-1a 32-bit hash: snel, deterministisch en gelijkmatig genoeg voor bucketing. */
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Bepaalt deterministisch de variant voor een bezoeker:
 * hash(visitorId + experimentId) modulo de som van de gewichten. Dezelfde
 * bezoeker krijgt zo altijd dezelfde variant, zonder aparte opslag.
 * Valt terug op "control" bij een gepauzeerd experiment of ongeldige gewichten.
 */
export function assignVariant<T extends ExperimentId>(
  experimentId: T,
  visitorId: string,
): ExperimentVariant<T> {
  const control = "control" as ExperimentVariant<T>;
  const definition = experiments[experimentId];
  if (definition.status !== "active") {
    return control;
  }

  const entries = Object.entries(definition.variants) as [ExperimentVariant<T>, number][];
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  if (totalWeight <= 0) {
    return control;
  }

  let bucket = fnv1a(`${visitorId}:${experimentId}`) % totalWeight;
  for (const [name, weight] of entries) {
    bucket -= weight;
    if (bucket < 0) {
      return name;
    }
  }
  return control;
}

/**
 * Leest het anonieme bezoekers-id uit de `sbv_ab_id` cookie. Geeft null op de
 * server of wanneer de cookie ontbreekt (bijvoorbeeld geblokkeerd); de
 * aanroeper valt dan terug op de controlevariant.
 */
export function readVisitorId(): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${AB_COOKIE_NAME}=([^;]+)`));
  const value = match?.[1];
  return value ? decodeURIComponent(value) : null;
}

/**
 * Varianten van alle actieve experimenten als platte Plausible-props, in de
 * vorm `exp_<experimentId>: <variant>`. Wordt door trackEvent aan
 * conversie-events toegevoegd zodat je in Plausible per variant kunt
 * vergelijken. Leeg object op de server of zonder cookie.
 */
export function getActiveExperimentProps(): Record<string, string> {
  const visitorId = readVisitorId();
  if (!visitorId) {
    return {};
  }
  const props: Record<string, string> = {};
  for (const id of Object.keys(experiments) as ExperimentId[]) {
    if (experiments[id].status === "active") {
      props[`exp_${id}`] = assignVariant(id, visitorId);
    }
  }
  return props;
}
