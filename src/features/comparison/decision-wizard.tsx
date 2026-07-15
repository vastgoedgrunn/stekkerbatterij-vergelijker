"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, RefreshCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { trackEvent } from "@/lib/observability/analytics";
import { rankProducts, type WizardPreferences } from "./ranking";
import { qualifyLeadPath } from "./qualification";
import { LeadPanel } from "./lead-panel";
import { OfferLink } from "@/features/offers-pricing/offer-link";
import { EnergyUpsellStrip } from "@/components/patterns/energy-upsell-strip";
import type { ProductListItem } from "@/features/products/types";

const usageOptions = [
  { label: "Laag (< 2.000 kWh)", value: 1800 },
  { label: "Gemiddeld (2.000–3.500 kWh)", value: 2750 },
  { label: "Hoog (> 3.500 kWh)", value: 4500 },
];

const solarKwpOptions = [
  { label: "Klein (< 3 kWp)", value: 2 },
  { label: "Gemiddeld (3–6 kWp)", value: 4.5 },
  { label: "Groot (> 6 kWp)", value: 8 },
];

const budgetOptions = [
  { label: "Tot € 900", value: 90000 },
  { label: "€ 900 – € 1.500", value: 150000 },
  { label: "Geen limiet", value: 0 },
];

type Step = 0 | 1 | 2 | 3 | 4 | 5;

export function DecisionWizard({ products }: { products: ProductListItem[] }) {
  const [step, setStep] = React.useState<Step>(0);
  const [prefs, setPrefs] = React.useState<WizardPreferences>({
    yearlyUsageKwh: 2750,
    hasSolar: true,
    solarKwp: 4.5,
    hasHeatPump: false,
    hasEv: false,
    budgetCents: 0,
    wantExpandable: false,
  });

  const totalSteps = 5;
  const isResult = step === 5;
  const qualification = React.useMemo(() => qualifyLeadPath(prefs), [prefs]);
  const showLeadPath = qualification.path === "fixed_battery";
  const showBothPaths = qualification.path === "both";

  const recommendations = React.useMemo(
    () => (isResult && !showLeadPath ? rankProducts(products, prefs).slice(0, 3) : []),
    [isResult, showLeadPath, products, prefs],
  );

  const bothRecommendations = React.useMemo(
    () => (isResult && showBothPaths ? rankProducts(products, prefs).slice(0, 2) : []),
    [isResult, showBothPaths, products, prefs],
  );

  React.useEffect(() => {
    if (isResult && (recommendations[0] || showLeadPath)) {
      trackEvent({
        name: "decision_wizard_completed",
        props: { recommendedId: recommendations[0]?.product.id ?? "lead" },
      });
    }
  }, [isResult, recommendations, showLeadPath]);

  const next = () => setStep((s) => Math.min(5, s + 1) as Step);
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
            onSelect={(value) =>
              setPrefs((p) => ({
                ...p,
                hasSolar: value === 1,
                solarKwp: value === 1 ? p.solarKwp || 4.5 : 0,
              }))
            }
          />
          {prefs.hasSolar && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium">Hoeveel kWp heb je ongeveer?</p>
              <OptionGroup
                options={solarKwpOptions}
                selected={prefs.solarKwp}
                onSelect={(value) => setPrefs((p) => ({ ...p, solarKwp: value }))}
              />
            </div>
          )}
        </WizardStep>
      )}

      {step === 2 && (
        <WizardStep title="Warmtepomp of elektrische auto?">
          <p className="text-muted-foreground mb-4 text-sm">
            Deze apparaten verhogen je piekverbruik — relevant voor de juiste batterijkeuze.
          </p>
          <p className="mb-2 text-sm font-medium">Heb je een warmtepomp?</p>
          <OptionGroup
            options={[
              { label: "Ja", value: 1 },
              { label: "Nee", value: 0 },
            ]}
            selected={prefs.hasHeatPump ? 1 : 0}
            onSelect={(value) => setPrefs((p) => ({ ...p, hasHeatPump: value === 1 }))}
          />
          <p className="mt-6 mb-2 text-sm font-medium">Laad je een elektrische auto thuis op?</p>
          <OptionGroup
            options={[
              { label: "Ja", value: 1 },
              { label: "Nee", value: 0 },
            ]}
            selected={prefs.hasEv ? 1 : 0}
            onSelect={(value) => setPrefs((p) => ({ ...p, hasEv: value === 1 }))}
          />
        </WizardStep>
      )}

      {step === 3 && (
        <WizardStep title="Wat is je budget?">
          <OptionGroup
            options={budgetOptions}
            selected={prefs.budgetCents}
            onSelect={(value) => setPrefs((p) => ({ ...p, budgetCents: value }))}
          />
        </WizardStep>
      )}

      {step === 4 && (
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
          <div className="text-center">
            <Badge variant="default" className="mb-2">
              Klaar!
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight">Onze aanbeveling voor jou</h2>
          </div>

          {(showLeadPath || showBothPaths) && (
            <LeadPanel qualification={qualification} source="wizard" />
          )}

          {!showLeadPath && qualification.reasons.length > 0 && (
            <p className="text-muted-foreground text-center text-sm leading-relaxed">
              {qualification.reasons.slice(0, 2).join(" · ")}
            </p>
          )}

          {!showLeadPath && recommendations.length === 0 && (
            <p className="text-muted-foreground text-center">
              We konden nog geen aanbeveling doen. Bekijk het volledige aanbod in de catalogus.
            </p>
          )}

          {(showBothPaths ? bothRecommendations : recommendations).map((rec, i) => {
            const imageUrl = getPublicImageUrl(rec.product.imagePath);
            return (
              <Card
                key={rec.product.id}
                interactive
                className={cn(i === 0 && "border-primary/40 ring-primary/15 ring-2")}
              >
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="from-accent/50 to-muted relative size-24 shrink-0 self-center overflow-hidden rounded-2xl bg-gradient-to-br">
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={rec.product.name}
                        fill
                        sizes="96px"
                        className="object-contain p-2"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {i === 0 && <Badge variant="default">Beste match</Badge>}
                      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        {rec.product.brand.name}
                      </p>
                    </div>
                    <Link
                      href={`/batterijen/${rec.product.slug}`}
                      className="hover:text-primary text-lg font-semibold"
                    >
                      {rec.product.name}
                    </Link>
                    <ul className="mt-2 space-y-1">
                      {rec.reasons.map((reason) => (
                        <li
                          key={reason}
                          className="text-muted-foreground flex items-center gap-1.5 text-sm"
                        >
                          <Check className="text-success size-3.5 shrink-0" /> {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col items-stretch gap-2 sm:items-end sm:text-right">
                    {rec.product.lowestPriceCents !== null && (
                      <p className="text-xl font-bold">
                        {formatPrice(rec.product.lowestPriceCents)}
                      </p>
                    )}
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <Link
                        href={`/batterijen/${rec.product.slug}`}
                        className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                      >
                        Bekijk details
                      </Link>
                      {rec.product.bestOffer?.affiliateUrl && (
                        <OfferLink
                          offerId={rec.product.bestOffer.id}
                          productId={rec.product.id}
                          merchant={rec.product.bestOffer.merchantName}
                          sponsored={rec.product.bestOffer.isSponsored}
                          estimatedCommissionCents={rec.product.bestOffer.estimatedCommissionCents}
                          placement="wizard"
                          size="sm"
                        >
                          Naar {rec.product.bestOffer.merchantName}
                        </OfferLink>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <EnergyUpsellStrip />

          <div className="flex justify-center pt-2">
            <Button variant="outline" onClick={restart}>
              <RefreshCw className="size-4" /> Opnieuw beginnen
            </Button>
          </div>
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
