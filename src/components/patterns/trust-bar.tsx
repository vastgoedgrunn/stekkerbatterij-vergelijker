import Link from "next/link";
import type { Route } from "next";
import { Scale } from "lucide-react";
import { getCatalogStats } from "@/features/products/queries";
import { cn } from "@/lib/utils";

export async function TrustBar({ className }: { className?: string }) {
  const { modelCount, brandCount } = await getCatalogStats();

  return (
    <div
      className={cn(
        "border-border/70 bg-muted/40 text-muted-foreground border-b text-xs sm:text-sm",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2">
        <span className="text-foreground font-medium">{modelCount} modellen</span>
        <span aria-hidden>·</span>
        <span>{brandCount} merken</span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1">
          <Scale className="size-3.5" aria-hidden />
          Onafhankelijk
        </span>
        <span aria-hidden>·</span>
        <Link
          href={"/over-ons/hoe-wij-vergelijken" as Route}
          className="text-primary font-medium hover:underline"
        >
          Hoe wij vergelijken
        </Link>
      </div>
    </div>
  );
}
