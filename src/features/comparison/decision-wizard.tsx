"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { trackEvent } from "@/lib/observability/analytics";
import { rankProducts, type WizardPreferences } from "./ranking";
import type { ProductListItem } from "@/features/products/types";

const usageOptions = [
  { label: "Laag (< 2.000 kWh)", value: 1800 },
  { label: "Gemiddeld (2.000–3.500 kWh)", value: 2750 },
  { label: "Hoog (> 3.500 kWh)", value: 4500 },
];

const budgetOptions = [
  { label: "Tot € 900", value: 90000 },
  { label: "€ 900 – € 1.500", value: 150000 },
  { label: "Geen limiet", value: 0 },
];

type Step = 0 | 1 | 2 | 3 | 4;

export function DecisionWizard({ products }: { products: ProductListItem[] }) {
  const [step, setStep] = React.useState<Step>(0);
  const [prefs, setPrefs] = React.useState<WizardPreferences>({
    yearlyUsageKwh: 2750,
    hasSolar: true,
    budgetCents: 0,
    wantExpandable: false,
  });

  const totalSteps = 4;
  const isResult = step === 4;
  const recommendations = React.useMemo(
    () => (isResult ? rankProducts(products, prefs).slice(0, 3) : []),
    [isResult, products, prefs],
  );

  React.useEffect(() => {
    if (isResult && recommendations[0]) {
      trackEvent({
        name: "decision_wizard_completed",
        props: { recommendedId: recommendations[0].product.id },
      });
    }
  }, [isResult, recommendations]);

  const next = () => setStep((s) => Math.min(4, s + 1) as Step);
  const back = () => setStep((s) => Math.max(0, s - 1) as Step);
  const restart = () => setStep(0);

  return (
    <div className="mx-auto max-w-2xl">
      {!isResult && (
        <div className="mb-6">
          <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full transition-all"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            Stap {step + 1} van {totalSteps}
          </p>
        </div>
      )}

      {step === 0 && (
        <WizardStep title="Wat is je jaarlijkse stroomverbruik?">
          <OptionGroup
            options={usageOptions}
            selected={prefs.yearlyUsageKwh}
            onSelect={(value) => setPrefs((p) => ({ ...p, yearlyUsageKwh: value }))}
          />
        </WizardStep>
      )}

      {step === 1 && (
        <WizardStep title="Heb je zonnepanelen?">
          <OptionGroup
            options={[
              { label: "Ja", value: 1 },
              { label: "Nee", value: 0 },
            ]}
            selected={prefs.hasSolar ? 1 : 0}
            onSelect={(value) => setPrefs((p) => ({ ...p, hasSolar: value === 1 }))}
          />
        </WizardStep>
      )}

      {step === 2 && (
        <WizardStep title="Wat is je budget?">
          <OptionGroup
            options={budgetOptions}
            selected={prefs.budgetCents}
            onSelect={(value) => setPrefs((p) => ({ ...p, budgetCents: value }))}
          />
        </WizardStep>
      )}

      {step === 3 && (
        <WizardStep title="Wil je later kunnen uitbreiden?">
          <OptionGroup
            options={[
              { label: "Ja, uitbreidbaar", value: 1 },
              { label: "Niet nodig", value: 0 },
            ]}
            selected={prefs.wantExpandable ? 1 : 0}
            onSelect={(value) => setPrefs((p) => ({ ...p, wantExpandable: value === 1 }))}
          />
        </WizardStep>
      )}

      {isResult && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Onze aanbeveling</h2>
          {recommendations.length === 0 ? (
            <p className="text-muted-foreground">
              We konden nog geen aanbeveling doen. Bekijk het volledige aanbod in de catalogus.
            </p>
          ) : (
            recommendations.map((rec, i) => (
              <Card key={rec.product.id}>
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {i === 0 && <Badge variant="success">Beste match</Badge>}
                      <p className="text-muted-foreground text-xs tracking-wide uppercase">
                        {rec.product.brand.name}
                      </p>
                    </div>
                    <Link
                      href={`/batterijen/${rec.product.slug}`}
                      className="text-lg font-semibold hover:underline"
                    >
                      {rec.product.name}
                    </Link>
                    <ul className="mt-2 space-y-1">
                      {rec.reasons.map((reason) => (
                        <li key={reason} className="text-muted-foreground text-sm">
                          • {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-right">
                    {rec.product.lowestPriceCents !== null && (
                      <p className="text-lg font-bold">
                        {formatPrice(rec.product.lowestPriceCents)}
                      </p>
                    )}
                    <Link
                      href={`/batterijen/${rec.product.slug}`}
                      className="text-primary text-sm hover:underline"
                    >
                      Bekijk details
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          <Button variant="outline" onClick={restart}>
            <RefreshCw className="size-4" /> Opnieuw beginnen
          </Button>
        </div>
      )}

      {!isResult && (
        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0}>
            <ArrowLeft className="size-4" /> Vorige
          </Button>
          <Button onClick={next}>
            {step === totalSteps - 1 ? "Toon aanbeveling" : "Volgende"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function WizardStep({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      {children}
    </div>
  );
}

function OptionGroup({
  options,
  selected,
  onSelect,
}: {
  options: { label: string; value: number }[];
  selected: number;
  onSelect: (value: number) => void;
}) {
  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onSelect(option.value)}
          aria-pressed={selected === option.value}
          className={cn(
            "focus-visible:ring-ring rounded-xl border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
            selected === option.value
              ? "border-primary bg-primary/5 ring-primary ring-1"
              : "border-border hover:bg-accent",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
