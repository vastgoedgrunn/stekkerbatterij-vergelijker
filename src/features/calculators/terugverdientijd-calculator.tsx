"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  DEFAULT_ASSUMPTIONS,
  DEFAULT_HORIZON_JAREN,
  computePayback,
  type PaybackInput,
} from "@/features/calculators/payback";

function formatEuro(value: number, maximumFractionDigits = 0): string {
  return formatNumber(value, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits,
  });
}

function formatJaren(value: number | null): string {
  if (value === null) return "n.v.t.";
  return `${formatNumber(value, { maximumFractionDigits: 1 })} jaar`;
}

interface FieldConfig {
  id: keyof State;
  label: string;
  min: number;
  max: number;
  step: number;
  /** Toont de waarde in de UI (bijv. met eenheid). */
  format: (value: number) => string;
  /** Korte uitleg onder het label. */
  hint: string;
}

interface State {
  jaarverbruikKwh: number;
  zelfverbruikPct: number;
  batterijcapaciteitKwh: number;
  aanschafprijsEuro: number;
  stroomprijsEuroPerKwh: number;
  terugleververgoedingEuroPerKwh: number;
}

const INITIAL: State = {
  jaarverbruikKwh: 3500,
  zelfverbruikPct: 40,
  batterijcapaciteitKwh: 5,
  aanschafprijsEuro: 1500,
  stroomprijsEuroPerKwh: DEFAULT_ASSUMPTIONS.stroomprijsEuroPerKwh,
  terugleververgoedingEuroPerKwh: DEFAULT_ASSUMPTIONS.terugleververgoedingEuroPerKwh,
};

const FIELDS: FieldConfig[] = [
  {
    id: "jaarverbruikKwh",
    label: "Jaarverbruik",
    min: 500,
    max: 10000,
    step: 100,
    format: (v) => `${formatNumber(v)} kWh`,
    hint: "Je totale stroomverbruik per jaar.",
  },
  {
    id: "zelfverbruikPct",
    label: "Aandeel via batterij",
    min: 0,
    max: 100,
    step: 5,
    format: (v) => `${formatNumber(v)}%`,
    hint: "Deel van je verbruik dat je via de batterij verschuift.",
  },
  {
    id: "batterijcapaciteitKwh",
    label: "Batterijcapaciteit",
    min: 1,
    max: 20,
    step: 0.5,
    format: (v) => `${formatNumber(v, { maximumFractionDigits: 1 })} kWh`,
    hint: "Bruikbare capaciteit van de stekkerbatterij.",
  },
  {
    id: "aanschafprijsEuro",
    label: "Aanschafprijs",
    min: 300,
    max: 6000,
    step: 50,
    format: (v) => formatEuro(v),
    hint: "Eenmalige investering inclusief installatie.",
  },
  {
    id: "stroomprijsEuroPerKwh",
    label: "Stroomprijs",
    min: 0.1,
    max: 0.6,
    step: 0.01,
    format: (v) => `${formatEuro(v, 2)} / kWh`,
    hint: "Je afnametarief inclusief belastingen.",
  },
  {
    id: "terugleververgoedingEuroPerKwh",
    label: "Terugleververgoeding",
    min: 0,
    max: 0.3,
    step: 0.01,
    format: (v) => `${formatEuro(v, 2)} / kWh`,
    hint: "Wat je ontvangt per teruggeleverde kWh.",
  },
];

function toInput(state: State): PaybackInput {
  return {
    jaarverbruikKwh: state.jaarverbruikKwh,
    zelfverbruikAandeel: state.zelfverbruikPct / 100,
    batterijcapaciteitKwh: state.batterijcapaciteitKwh,
    aanschafprijsEuro: state.aanschafprijsEuro,
    stroomprijsEuroPerKwh: state.stroomprijsEuroPerKwh,
    terugleververgoedingEuroPerKwh: state.terugleververgoedingEuroPerKwh,
  };
}

/** Interactieve terugverdientijd- & besparingscalculator (indicatief). */
export function TerugverdientijdCalculator({ className }: { className?: string }) {
  const [state, setState] = React.useState<State>(INITIAL);

  const result = React.useMemo(
    () => computePayback(toInput(state), DEFAULT_HORIZON_JAREN),
    [state],
  );

  function update(id: keyof State, value: number) {
    setState((prev) => ({ ...prev, [id]: Number.isFinite(value) ? value : 0 }));
  }

  const resultCards: { label: string; value: string; accent?: boolean }[] = [
    {
      label: "Geschatte jaarbesparing",
      value: formatEuro(result.annualSavingsEuro),
      accent: true,
    },
    {
      label: "Terugverdientijd",
      value: formatJaren(result.paybackYears),
    },
    {
      label: `Besparing over ${result.horizonJaren} jaar`,
      value: formatEuro(result.savingsOverHorizonEuro),
    },
  ];

  return (
    <div className={cn("grid gap-6 lg:grid-cols-5", className)}>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Vul je situatie in</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {FIELDS.map((field) => {
            const value = state[field.id];
            const rangeId = `range-${field.id}`;
            const numberId = `number-${field.id}`;
            return (
              <div key={field.id} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor={rangeId} className="text-sm font-medium">
                    {field.label}
                  </label>
                  <span className="text-primary text-sm font-semibold tabular-nums">
                    {field.format(value)}
                  </span>
                </div>
                <input
                  id={rangeId}
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={value}
                  onChange={(e) => update(field.id, e.currentTarget.valueAsNumber)}
                  aria-describedby={`${numberId}-hint`}
                  className="accent-primary h-11 w-full cursor-pointer"
                />
                <div className="flex items-center justify-between gap-3">
                  <p id={`${numberId}-hint`} className="text-muted-foreground text-xs">
                    {field.hint}
                  </p>
                  <input
                    id={numberId}
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={value}
                    onChange={(e) => update(field.id, e.currentTarget.valueAsNumber)}
                    aria-label={`${field.label} exact invoeren`}
                    className="border-border bg-background focus-visible:ring-ring/60 h-11 w-24 rounded-lg border px-3 text-right text-sm tabular-nums focus-visible:ring-2 focus-visible:outline-none"
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6 lg:col-span-2">
        <div className="grid gap-4">
          {resultCards.map((card) => (
            <Card key={card.label} className={cn(card.accent && "border-primary/30 bg-primary/5")}>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-sm">{card.label}</p>
                <p
                  className={cn(
                    "mt-1 text-3xl font-bold tracking-tight tabular-nums",
                    card.accent && "text-primary",
                  )}
                >
                  {card.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-muted-foreground flex items-start gap-2 text-xs leading-relaxed">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            Deze uitkomsten zijn <strong>indicatief</strong> en sterk afhankelijk van je eigen
            situatie en energieprijzen. Het zijn schattingen op basis van de ingevulde aannames,
            geen garantie. Werkelijke besparing verschilt per huishouden, contract en
            verbruikspatroon.
          </span>
        </p>
      </div>
    </div>
  );
}
