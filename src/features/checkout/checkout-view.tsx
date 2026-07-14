"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useCart } from "./cart-store";
import { createCheckout, type CheckoutState } from "./actions";
import { Container } from "@/components/patterns/section";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackEvent } from "@/lib/observability/analytics";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const initialState: CheckoutState = { status: "idle" };

function SubmitButton({ totalCents }: { totalCents: number }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Bezig…" : `Betaal ${formatPrice(totalCents)}`}
    </Button>
  );
}

export function CheckoutView() {
  const { items, totals, clear } = useCart();
  const [state, formAction] = useActionState(createCheckout, initialState);
  const startedTracked = useRef(false);

  // Bij een geldige redirect-URL: winkelmand legen en doorsturen naar Mollie.
  useEffect(() => {
    if (state.redirectUrl) {
      clear();
      window.location.href = state.redirectUrl;
    }
  }, [state.redirectUrl, clear]);

  useEffect(() => {
    if (items.length > 0 && !startedTracked.current) {
      startedTracked.current = true;
      trackEvent({ name: "checkout_started", props: { orderValueCents: totals.totalCents } });
    }
  }, [items.length, totals.totalCents]);

  if (items.length === 0) {
    return (
      <Container className="py-16">
        <div className="border-border mx-auto max-w-lg rounded-2xl border border-dashed p-12 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Je winkelmand is leeg</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Voeg eerst een product toe voordat je afrekent.
          </p>
          <Link href="/batterijen" className={cn(buttonVariants(), "mt-6")}>
            Naar de catalogus
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold tracking-tight">Afrekenen</h1>
      <form action={formAction} className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <input type="hidden" name="cart" value={JSON.stringify(items)} />

        <div className="space-y-5">
          <fieldset className="border-border bg-card space-y-4 rounded-2xl border p-5">
            <legend className="px-2 text-sm font-semibold">Contact & bezorgadres</legend>

            <div className="space-y-2">
              <Label htmlFor="fullName">Volledige naam</Label>
              <Input id="fullName" name="fullName" required autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mailadres</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Bedrijf (optioneel)</Label>
              <Input id="company" name="company" autoComplete="organization" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="line1">Straat en huisnummer</Label>
              <Input id="line1" name="line1" required autoComplete="address-line1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="line2">Toevoeging (optioneel)</Label>
              <Input id="line2" name="line2" autoComplete="address-line2" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postcode</Label>
                <Input id="postalCode" name="postalCode" required autoComplete="postal-code" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Woonplaats</Label>
                <Input id="city" name="city" required autoComplete="address-level2" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Land</Label>
                <Input
                  id="country"
                  name="country"
                  defaultValue="NL"
                  maxLength={2}
                  autoComplete="country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefoon (optioneel)</Label>
                <Input id="phone" name="phone" type="tel" autoComplete="tel" />
              </div>
            </div>
          </fieldset>

          {state.status === "error" && state.message && (
            <p className="text-destructive text-sm" role="alert">
              {state.message}
            </p>
          )}
        </div>

        <aside className="border-border bg-card h-fit rounded-2xl border p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Je bestelling</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((item) => (
              <li key={item.offerId} className="flex justify-between gap-3">
                <span className="min-w-0">
                  <span className="text-muted-foreground">{item.quantity}× </span>
                  {item.name}
                </span>
                <span className="whitespace-nowrap">
                  {formatPrice(item.unitPriceCents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="border-border mt-4 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotaal (excl. btw)</dt>
              <dd>{formatPrice(totals.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Btw ({Math.round(totals.vatRate * 100)}%)</dt>
              <dd>{formatPrice(totals.vatCents)}</dd>
            </div>
            <div className="flex justify-between text-base font-bold">
              <dt>Totaal</dt>
              <dd>{formatPrice(totals.totalCents)}</dd>
            </div>
          </dl>
          <div className="mt-5">
            <SubmitButton totalCents={totals.totalCents} />
          </div>
          <p className="text-muted-foreground mt-3 text-center text-xs">
            Je wordt doorgestuurd naar Mollie om veilig te betalen.
          </p>
        </aside>
      </form>
    </Container>
  );
}
