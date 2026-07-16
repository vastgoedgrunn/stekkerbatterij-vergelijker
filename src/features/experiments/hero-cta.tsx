"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useExperiment } from "@/lib/experiments/use-experiment";
import type { ExperimentVariant } from "@/lib/experiments/experiments";
import { cn } from "@/lib/utils";

const ctaCopy = {
  control: "Start de beslishulp",
  snelle_belofte: "Vind jouw batterij in 1 minuut",
} as const satisfies Record<ExperimentVariant<"hero_cta_copy">, string>;

/**
 * Primaire hero-CTA op de homepage, onderdeel van het experiment
 * `hero_cta_copy`. Klein client component zodat de rest van de (statische)
 * pagina een server component blijft; de server rendert de control-copy en
 * alleen de testvariant wisselt na hydration van tekst.
 */
export function HeroCta() {
  const variant = useExperiment("hero_cta_copy");

  return (
    <Link href="/beslishulp" className={cn(buttonVariants({ size: "lg" }))}>
      {ctaCopy[variant]} <ArrowRight className="size-4" />
    </Link>
  );
}
