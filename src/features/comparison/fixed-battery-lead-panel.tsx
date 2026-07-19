"use client";

import * as React from "react";
import {
  ArrowRight,
  Battery,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Home,
  Mail,
  Phone,
  Wrench,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/observability/analytics";
import { submitLeadAction } from "@/features/leads/actions";
import { formatPrice } from "@/lib/format";
import type { QualificationResult } from "./qualification";

const NEXT_STEPS = [
  { icon: Phone, title: "Adviesgesprek", detail: "Kort gesprek over verbruik en woning" },
  { icon: ClipboardList, title: "Persoonlijk aanbod", detail: "Offerte op maat, vrijblijvend" },
  { icon: CalendarCheck, title: "Jouw akkoord", detail: "Pas tekenen als het klopt" },
  { icon: Wrench, title: "Installatie plannen", detail: "Datum afstemmen met monteur" },
  { icon: CheckCircle2, title: "Klaar voor gebruik", detail: "In bedrijf en toegelicht" },
] as const;

export interface FixedBatteryLeadPanelProps {
  source?: string;
  productId?: string;
  productSlug?: string;
  productName?: string;
  indicativePriceMinCents?: number | null;
  indicativePriceMaxCents?: number | null;
  qualification?: QualificationResult | null;
  compact?: boolean;
}

export function FixedBatteryLeadPanel({
  source = "pdp",
  productId,
  productSlug,
  productName,
  indicativePriceMinCents = null,
  indicativePriceMaxCents = null,
  qualification = null,
  compact = false,
}: FixedBatteryLeadPanelProps) {
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (qualification) {
      trackEvent({
        name: "lead_qualified",
        props: {
          path: qualification.path,
          source,
          ...(productSlug ? { productSlug } : {}),
        },
      });
    }
  }, [qualification, source, productSlug]);

  const eWndrHref = productSlug
    ? `/api/go/lead/e-wndr?product=${encodeURIComponent(productSlug)}`
    : "/api/go/lead/e-wndr";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("source", source);
    if (productId) formData.set("productId", productId);
    formData.set(
      "qualification",
      JSON.stringify({
        ...(qualification ?? {}),
        productSlug: productSlug ?? null,
        productName: productName ?? null,
      }),
    );

    startTransition(async () => {
      const result = await submitLeadAction(formData);
      if (result.ok) {
        setSubmitted(true);
        if (productSlug) {
          trackEvent({
            name: "fixed_product_lead_clicked",
            props: { slug: productSlug, partner: "own-lead", source },
          });
        }
      } else {
        setError(result.error ?? "Er ging iets mis. Probeer het opnieuw.");
      }
    });
  };

  const priceLabel =
    indicativePriceMinCents != null
      ? indicativePriceMaxCents != null && indicativePriceMaxCents !== indicativePriceMinCents
        ? `Richtprijs ${formatPrice(indicativePriceMinCents)} tot ${formatPrice(indicativePriceMaxCents)} incl. installatie`
        : `Richtprijs vanaf ${formatPrice(indicativePriceMinCents)} incl. installatie`
      : "Offerte op maat";

  return (
    <Card className={cn("border-primary/30 ring-primary/10 ring-2", compact && "ring-1")}>
      <CardContent className={cn("space-y-5", compact ? "p-5" : "p-6")}>
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
            <Home className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {productName
                ? `Offerte voor ${productName}`
                : "Vaste thuisbatterij past beter bij jou"}
            </h3>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              {productName
                ? "Installatie door een partner. Vrijblijvend oriënteren, zonder webshop-prijsdruk."
                : "Voor warmtepomp, EV of hoog verbruik is een geïnstalleerde thuisbatterij vaak passender dan plug-and-play."}
            </p>
            <p className="text-foreground mt-2 text-sm font-semibold">{priceLabel}</p>
            {indicativePriceMinCents != null && (
              <p className="text-muted-foreground mt-1 text-xs">
                Indicatief. De definitieve prijs is altijd een offerte op maat.
              </p>
            )}
            <ul className="text-muted-foreground mt-3 space-y-1.5 text-sm">
              <li className="flex items-start gap-2">
                <Battery className="text-primary mt-0.5 size-3.5 shrink-0" />
                Omvormer en meterkast worden meegenomen in de offerte
              </li>
              <li className="flex items-start gap-2">
                <Battery className="text-primary mt-0.5 size-3.5 shrink-0" />
                Richtprijs inclusief btw en standaard installatie
              </li>
              <li className="flex items-start gap-2">
                <Battery className="text-primary mt-0.5 size-3.5 shrink-0" />
                Planning en wachttijd verschillen per regio
              </li>
            </ul>
            {qualification && qualification.reasons.length > 0 && (
              <ul className="text-muted-foreground mt-3 space-y-1 text-sm">
                {qualification.reasons.slice(0, 3).map((reason) => (
                  <li key={reason} className="flex items-center gap-2">
                    <Battery className="text-primary size-3.5 shrink-0" />
                    {reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border-border rounded-xl border p-4">
            <p className="text-sm font-semibold">Direct offerte via partner</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Gratis oriëntatiegesprek via onze installatie-partner (affiliate).
            </p>
            <a
              href={eWndrHref}
              target="_blank"
              rel="nofollow sponsored noopener"
              onClick={() => {
                trackEvent({
                  name: "lead_affiliate_clicked",
                  props: {
                    partner: "e-wndr",
                    ...(productSlug ? { productSlug } : {}),
                    source,
                  },
                });
                if (productSlug) {
                  trackEvent({
                    name: "fixed_product_lead_clicked",
                    props: { slug: productSlug, partner: "e-wndr", source },
                  });
                }
              }}
              className={cn(buttonVariants({ size: "sm" }), "mt-3 w-full")}
            >
              Offerte aanvragen <ArrowRight className="size-4" />
            </a>
          </div>

          <div className="border-border rounded-xl border p-4">
            <p className="text-sm font-semibold">Persoonlijk advies van ons</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Laat je gegevens achter, wij bellen of mailen je binnen 2 werkdagen.
            </p>
          </div>
        </div>

        <p className="text-muted-foreground text-center text-xs">
          Vrijblijvend · Geen verplichting · Partner-installateur
        </p>

        {!compact && (
          <div className="border-border bg-muted/40 rounded-xl border px-4 py-4">
            <p className="text-sm font-semibold">Wat gebeurt er hierna?</p>
            <ol className="mt-3 grid gap-3 sm:grid-cols-5">
              {NEXT_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-2 sm:flex-col sm:gap-1.5">
                  <span className="bg-background text-primary border-border flex size-8 shrink-0 items-center justify-center rounded-lg border">
                    <step.icon className="size-4" aria-hidden />
                  </span>
                  <span>
                    <span className="text-muted-foreground block text-[10px] font-semibold tracking-wide uppercase">
                      Stap {index + 1}
                    </span>
                    <span className="block text-xs font-semibold">{step.title}</span>
                    <span className="text-muted-foreground block text-xs leading-snug">
                      {step.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {submitted ? (
          <p className="text-success bg-success/10 rounded-xl px-4 py-3 text-sm">
            Bedankt! We nemen contact op zodra je aanvraag is beoordeeld.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {productId && <input type="hidden" name="productId" value={productId} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`lead-name-${source}`}>Naam</Label>
                <Input id={`lead-name-${source}`} name="name" required autoComplete="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`lead-email-${source}`}>E-mail</Label>
                <Input
                  id={`lead-email-${source}`}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`lead-postal-${source}`}>Postcode</Label>
                <Input
                  id={`lead-postal-${source}`}
                  name="postalCode"
                  required
                  autoComplete="postal-code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`lead-phone-${source}`}>Telefoon (optioneel)</Label>
                <Input id={`lead-phone-${source}`} name="phone" type="tel" autoComplete="tel" />
              </div>
            </div>
            <label className="text-muted-foreground flex items-start gap-2 text-xs">
              <input type="checkbox" name="consent" required className="mt-0.5" />
              <span>
                Ik ga akkoord met het verwerken van mijn gegevens voor een vrijblijvend advies. Zie
                ons privacybeleid.
              </span>
            </label>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" disabled={pending}>
              <Mail className="size-4" />
              {pending ? "Versturen…" : "Gratis advies aanvragen"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

/** @deprecated Gebruik FixedBatteryLeadPanel; wrapper voor wizard-compatibiliteit. */
export function LeadPanel({
  qualification,
  source = "wizard",
}: {
  qualification: QualificationResult;
  source?: string;
}) {
  return <FixedBatteryLeadPanel qualification={qualification} source={source} />;
}
