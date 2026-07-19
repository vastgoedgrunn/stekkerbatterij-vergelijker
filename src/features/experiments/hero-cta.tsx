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
 * Hero-CTA's: primaire beslishulp (A/B) + secundaire catalogus voor directe shoppers.
 */
export function HeroCta() {
  const variant = useExperiment("hero_cta_copy");

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link href="/beslishulp" className={cn(buttonVariants({ size: "lg" }))}>
        {ctaCopy[variant]} <ArrowRight className="size-4" />
      </Link>
      <Link
        href="/stekkerbatterijen"
        className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
      >
        Bekijk stekkerbatterijen
      </Link>
    </div>
  );
}
