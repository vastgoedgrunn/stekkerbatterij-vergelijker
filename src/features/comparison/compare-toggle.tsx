"use client";

import { Check, GitCompare } from "lucide-react";
import { useCompare } from "./compare-store";
import { cn } from "@/lib/utils";

export function CompareToggle({ slug, className }: { slug: string; className?: string }) {
  const { isSelected, toggle, isFull } = useCompare();
  const selected = isSelected(slug);
  const disabled = !selected && isFull;

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      disabled={disabled}
      aria-pressed={selected}
      title={
        selected
          ? "Verwijder uit vergelijking"
          : disabled
            ? "Maximum aantal bereikt"
            : "Voeg toe aan vergelijking"
      }
      className={cn(
        "focus-visible:ring-ring/50 inline-flex size-10 items-center justify-center rounded-xl border transition-all focus-visible:ring-4 focus-visible:outline-none disabled:opacity-40",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-background hover:border-primary/40 hover:bg-accent",
        className,
      )}
    >
      {selected ? <Check className="size-4" /> : <GitCompare className="size-4" />}
      <span className="sr-only">Vergelijk</span>
    </button>
  );
}
