"use client";

import * as React from "react";
import { ArrowRight, Battery, Home, Mail } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/observability/analytics";
import { submitLeadAction } from "@/features/leads/actions";
import type { QualificationResult } from "./qualification";

const EWNDR_AFFILIATE_URL = "https://e-wndr.nl/affiliate-worden/";

export function LeadPanel({
  qualification,
  source = "wizard",
}: {
  qualification: QualificationResult;
  source?: string;
}) {
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    trackEvent({
      name: "lead_qualified",
      props: { path: qualification.path, source },
    });
  }, [qualification.path, source]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("source", source);
    formData.set("qualification", JSON.stringify(qualification));

    startTransition(async () => {
      const result = await submitLeadAction(formData);
      if (result.ok) {
        setSubmitted(true);
      } else {
        setError(result.error ?? "Er ging iets mis. Probeer het opnieuw.");
      }
    });
  };

  return (
    <Card className="border-primary/30 ring-primary/10 ring-2">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
            <Home className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Vaste thuisbatterij past beter bij jou</h3>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              Voor jouw situatie (warmtepomp, EV of hoog verbruik) is een geïnstalleerde thuisbatterij
              vaak rendabeler dan een plug-in model. Wij helpen je verder — zonder verplichting.
            </p>
            <ul className="text-muted-foreground mt-3 space-y-1 text-sm">
              {qualification.reasons.slice(0, 3).map((reason) => (
                <li key={reason} className="flex items-center gap-2">
                  <Battery className="text-primary size-3.5 shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border-border rounded-xl border p-4">
            <p className="text-sm font-semibold">Direct offerte via partner</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Gratis oriëntatiegesprek via onze installatie-partner (affiliate).
            </p>
            <a
              href={EWNDR_AFFILIATE_URL}
              target="_blank"
              rel="nofollow sponsored noopener"
              onClick={() =>
                trackEvent({ name: "lead_affiliate_clicked", props: { partner: "e-wndr" } })
              }
              className={cn(buttonVariants({ size: "sm" }), "mt-3 w-full")}
            >
              Offerte aanvragen <ArrowRight className="size-4" />
            </a>
          </div>

          <div className="border-border rounded-xl border p-4">
            <p className="text-sm font-semibold">Persoonlijk advies van ons</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Laat je gegevens achter — wij bellen of mailen je binnen 2 werkdagen.
            </p>
          </div>
        </div>

        {submitted ? (
          <p className="text-success bg-success/10 rounded-xl px-4 py-3 text-sm">
            Bedankt! We nemen contact op zodra je aanvraag is beoordeeld.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lead-name">Naam</Label>
                <Input id="lead-name" name="name" required autoComplete="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-email">E-mail</Label>
                <Input
                  id="lead-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-postal">Postcode</Label>
                <Input id="lead-postal" name="postalCode" required autoComplete="postal-code" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-phone">Telefoon (optioneel)</Label>
                <Input id="lead-phone" name="phone" type="tel" autoComplete="tel" />
              </div>
            </div>
            <label className="text-muted-foreground flex items-start gap-2 text-xs">
              <input type="checkbox" name="consent" required className="mt-0.5" />
              <span>
                Ik ga akkoord met het verwerken van mijn gegevens voor een vrijblijvend advies.
                Zie ons privacybeleid.
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
