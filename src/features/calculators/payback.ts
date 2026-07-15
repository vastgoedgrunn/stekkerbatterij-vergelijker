/**
 * Terugverdientijd- en besparingscalculator: puur rekenmodel.
 *
 * BELANGRIJK: alle uitkomsten zijn SCHATTINGEN op basis van de aannames
 * hieronder. Dit zijn geen geverifieerde feiten. Er worden bewust GEEN
 * uitspraken over saldering, subsidies of regelgeving als feit hardgecodeerd.
 * De gebruiker kan alle aannames zelf aanpassen in de UI.
 *
 * Eenheden (bewust in hele euro's, niet in centen):
 *  - jaarverbruikKwh:            kWh per jaar
 *  - zelfverbruikAandeel:        fractie 0..1 (aandeel verbruik dat via de batterij verschuift)
 *  - batterijcapaciteitKwh:      kWh (bruikbare capaciteit)
 *  - aanschafprijsEuro:          € (eenmalige investering)
 *  - stroomprijsEuroPerKwh:      € per kWh (afnametarief incl. belastingen)
 *  - terugleververgoedingEuroPerKwh: € per kWh (vergoeding bij teruglevering)
 *  - cyclusfactor:               fractie 0..1 (effectief benutte cycli per dag, ~1 cyclus/dag)
 */

/** Instelbare aannames met redelijke NL-defaults. */
export const DEFAULT_ASSUMPTIONS = {
  /** Gemiddeld afnametarief incl. belastingen (€/kWh). */
  stroomprijsEuroPerKwh: 0.3,
  /** Gangbare terugleververgoeding (€/kWh). */
  terugleververgoedingEuroPerKwh: 0.05,
  /**
   * Effectief benutte laad-/ontlaadcycli per dag. In de praktijk haal je
   * zelden 365 volledige cycli; ~1 cyclus/dag is een optimistisch maximum.
   */
  cyclusfactor: 1,
} as const;

/** Aantal dagen per jaar dat de batterij (deels) een cyclus kan draaien. */
const DAGEN_PER_JAAR = 365;

/** Standaard horizon voor cumulatieve besparing (jaren). */
export const DEFAULT_HORIZON_JAREN = 10;

export interface PaybackInput {
  /** Jaarverbruik in kWh. */
  jaarverbruikKwh: number;
  /** Aandeel van het verbruik dat via de batterij verschuift, als fractie 0..1. */
  zelfverbruikAandeel: number;
  /** Bruikbare batterijcapaciteit in kWh. */
  batterijcapaciteitKwh: number;
  /** Eenmalige aanschafprijs in euro. */
  aanschafprijsEuro: number;
  /** Afnametarief in €/kWh. */
  stroomprijsEuroPerKwh?: number;
  /** Terugleververgoeding in €/kWh. */
  terugleververgoedingEuroPerKwh?: number;
  /** Effectief benutte cycli per dag als fractie 0..1. */
  cyclusfactor?: number;
}

/** Zorgt dat een waarde een eindig, niet-negatief getal is. */
function nonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/** Beperkt een waarde tot het bereik [min, max]. */
function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Schat het aantal kWh dat per jaar door de batterij verschoven wordt.
 *
 * Dit is het minimum van (a) wat de batterij fysiek kan verschuiven op basis
 * van capaciteit en cycli, en (b) wat de gebruiker daadwerkelijk zelf kan
 * verbruiken (jaarverbruik × aandeel). Zo voorkomen we dat we besparing
 * toeschrijven aan energie die er niet is.
 */
export function computeShiftedKwh(input: PaybackInput): number {
  const capaciteit = nonNegative(input.batterijcapaciteitKwh);
  const verbruik = nonNegative(input.jaarverbruikKwh);
  const aandeel = clamp(input.zelfverbruikAandeel, 0, 1);
  const cyclusfactor = clamp(input.cyclusfactor ?? DEFAULT_ASSUMPTIONS.cyclusfactor, 0, 1);

  const potentieelBatterij = capaciteit * DAGEN_PER_JAAR * cyclusfactor;
  const potentieelVerbruik = verbruik * aandeel;

  return Math.min(potentieelBatterij, potentieelVerbruik);
}

/**
 * Geschatte jaarbesparing in euro.
 *
 * Per verschoven kWh bespaar je het verschil tussen wat je anders had betaald
 * (stroomprijs) en wat je anders had ontvangen bij teruglevering
 * (terugleververgoeding). Is dat verschil ≤ 0, dan is er geen besparing.
 */
export function computeAnnualSavings(input: PaybackInput): number {
  const stroomprijs = nonNegative(
    input.stroomprijsEuroPerKwh ?? DEFAULT_ASSUMPTIONS.stroomprijsEuroPerKwh,
  );
  const teruglevering = nonNegative(
    input.terugleververgoedingEuroPerKwh ?? DEFAULT_ASSUMPTIONS.terugleververgoedingEuroPerKwh,
  );

  const margePerKwh = stroomprijs - teruglevering;
  if (margePerKwh <= 0) return 0;

  return computeShiftedKwh(input) * margePerKwh;
}

/**
 * Geschatte terugverdientijd in jaren = aanschafprijs / jaarbesparing.
 *
 * Als er geen (positieve) jaarbesparing is, is de terugverdientijd niet
 * bepaalbaar en geven we `null` terug (voorkomt deling door nul / oneindig).
 */
export function computePaybackYears(input: PaybackInput): number | null {
  const jaarbesparing = computeAnnualSavings(input);
  const prijs = nonNegative(input.aanschafprijsEuro);

  if (jaarbesparing <= 0) return null;
  if (prijs === 0) return 0;

  return prijs / jaarbesparing;
}

/**
 * Cumulatieve (bruto) besparing over een aantal jaren.
 *
 * Simpel lineair model: jaarbesparing × jaren. Houdt bewust géén rekening met
 * prijsstijgingen, degradatie of rente. Het is een indicatieve schatting.
 */
export function computeSavingsOverYears(
  input: PaybackInput,
  jaren: number = DEFAULT_HORIZON_JAREN,
): number {
  const horizon = nonNegative(jaren);
  return computeAnnualSavings(input) * horizon;
}

export interface PaybackResult {
  /** Geschat aantal kWh per jaar dat door de batterij verschoven wordt. */
  shiftedKwh: number;
  /** Geschatte jaarbesparing in euro. */
  annualSavingsEuro: number;
  /** Geschatte terugverdientijd in jaren, of null als niet bepaalbaar. */
  paybackYears: number | null;
  /** Geschatte cumulatieve besparing over de horizon in euro. */
  savingsOverHorizonEuro: number;
  /** Gehanteerde horizon in jaren. */
  horizonJaren: number;
}

/** Berekent alle uitkomsten in één keer. */
export function computePayback(
  input: PaybackInput,
  horizonJaren: number = DEFAULT_HORIZON_JAREN,
): PaybackResult {
  return {
    shiftedKwh: computeShiftedKwh(input),
    annualSavingsEuro: computeAnnualSavings(input),
    paybackYears: computePaybackYears(input),
    savingsOverHorizonEuro: computeSavingsOverYears(input, horizonJaren),
    horizonJaren,
  };
}
