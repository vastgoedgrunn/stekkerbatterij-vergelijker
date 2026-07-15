"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { rankProducts, type WizardPreferences } from "./ranking";
import type { ProductListItem } from "@/features/products/types";

const usageOptions = [
  { label: "Laag", value: 1800 },
  { label: "Gemiddeld", value: 2750 },
  { label: "Hoog", value: 4500 },
];

/**
 * Compacte, interactieve "vind jouw batterij" voor de hero. Werkt live:
 * elke keuze herberekent direct de beste match met dezelfde transparante
 * scoring als de volledige beslishulp.
 */
export function HeroMatcher({ products }: { products: ProductListItem[] }) {
  const [prefs, setPrefs] = React.useState<WizardPreferences>({
    yearlyUsageKwh: 2750,
    hasSolar: true,
    solarKwp: 4.5,
    hasHeatPump: false,
    hasEv: false,
    budgetCents: 0,
    wantExpandable: false,
  });

  const top = React.useMemo(() => rankProducts(products, prefs).slice(0, 1)[0], [products, prefs]);
  const imageUrl = top ? getPublicImageUrl(top.product.imagePath) : null;

  return (
    <div className="border-border/70 bg-card/70 rounded-3xl border p-5 shadow-[var(--shadow-lg)] backdrop-blur-sm sm:p-6">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="text-primary size-4" />
        Vind jouw batterij in 10 seconden
      </div>

      <div className="mt-4 space-y-4">
        <Segment
          label="Jaarverbruik"
          options={usageOptions.map((o) => ({
            label: o.label,
            active: prefs.yearlyUsageKwh === o.value,
            onClick: () => setPrefs((p) => ({ ...p, yearlyUsageKwh: o.value })),
          }))}
        />
        <div className="grid grid-cols-2 gap-4">
          <Segment
            label="Zonnepanelen"
            options={[
              {
                label: "Ja",
                active: prefs.hasSolar,
                onClick: () => setPrefs((p) => ({ ...p, hasSolar: true })),
              },
              {
                label: "Nee",
                active: !prefs.hasSolar,
                onClick: () => setPrefs((p) => ({ ...p, hasSolar: false })),
              },
            ]}
          />
          <Segment
            label="Uitbreidbaar"
            options={[
              {
                label: "Ja",
                active: prefs.wantExpandable,
                onClick: () => setPrefs((p) => ({ ...p, wantExpandable: true })),
              },
              {
                label: "Nee",
                active: !prefs.wantExpandable,
                onClick: () => setPrefs((p) => ({ ...p, wantExpandable: false })),
              },
            ]}
          />
        </div>
      </div>

      {top && (
        <div className="border-border/70 mt-5 border-t pt-5">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Jouw beste match
          </p>
          <Link
            href={`/batterijen/${top.product.slug}`}
            className="group mt-2 flex items-center gap-4"
          >
            <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-xl">
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={top.product.name}
                  fill
                  sizes="64px"
                  className="object-contain p-1.5"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-xs">{top.product.brand.name}</p>
              <p className="group-hover:text-primary truncate font-semibold">{top.product.name}</p>
              {top.product.lowestPriceCents !== null && (
                <p className="text-sm">
                  <span className="text-muted-foreground">vanaf </span>
                  <span className="font-bold">{formatPrice(top.product.lowestPriceCents)}</span>
                </p>
              )}
            </div>
            <ArrowRight className="text-primary size-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}

      <Link
        href="/beslishulp"
        className="text-primary mt-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
      >
        Uitgebreide beslishulp <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function Segment({
  label,
  options,
}: {
  label: string;
  options: { label: string; active: boolean; onClick: () => void }[];
}) {
  return (
    <div>
      <p className="text-muted-foreground mb-1.5 text-xs font-medium">{label}</p>
      <div className="bg-muted flex gap-1 rounded-xl p-1">
        {options.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={opt.onClick}
            aria-pressed={opt.active}
            className={cn(
              "flex-1 rounded-lg px-2 py-1.5 text-sm font-medium transition-all",
              opt.active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
