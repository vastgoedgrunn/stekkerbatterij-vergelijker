"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import type { MarketScore, ProductRating } from "@/features/products/types";

interface ProductRatingDisplayProps {
  /** Site-reviews (goedgekeurd). */
  rating: ProductRating;
  /** Externe marktscore (citeerbaar). */
  marketScore?: MarketScore | null;
  showCount?: boolean;
  className?: string;
  /** Toon bronlabel bij externe score. */
  showSource?: boolean;
  /** Compacte weergave op kaarten (minder jargon). */
  compact?: boolean;
}

/**
 * Toont eerst site-reviews; anders externe marktscore met duidelijk label.
 * Nooit als "onze reviews" presenteren wanneer de bron extern is.
 */
export function ProductRatingDisplay({
  rating,
  marketScore,
  showCount = true,
  className,
  showSource = true,
  compact = false,
}: ProductRatingDisplayProps) {
  const hasSiteReviews = rating.average !== null && rating.count > 0;
  const hasMarket =
    marketScore != null &&
    marketScore.average !== null &&
    marketScore.count > 0 &&
    Boolean(marketScore.sourceUrl);

  if (hasSiteReviews) {
    return (
      <RatingBlock
        average={rating.average!}
        count={rating.count}
        label={null}
        showCount={showCount}
        className={className}
      />
    );
  }

  if (hasMarket && marketScore) {
    const scopeHint = marketScore.scope === "brand" ? "merk" : null;
    const label = compact
      ? null
      : scopeHint
        ? `${marketScore.sourceName} (${scopeHint})`
        : marketScore.sourceName;

    return (
      <div className={cn("flex flex-col gap-0.5", className)}>
        <RatingBlock
          average={marketScore.average}
          count={marketScore.count}
          label={label}
          showCount={showCount}
          suffix={
            compact ? `· ${marketScore.sourceName}${scopeHint ? ` (${scopeHint})` : ""}` : undefined
          }
        />
        {showSource && !compact && (
          <a
            href={marketScore.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Bron: {marketScore.sourceName}
          </a>
        )}
      </div>
    );
  }

  // Geen lege sterrenrij: dat suggereert ontbrekende site-reviews terwijl marktscore elders leeft.
  return null;
}

function RatingBlock({
  average,
  count,
  label,
  showCount,
  className,
  suffix,
}: {
  average: number;
  count: number;
  label: string | null;
  showCount: boolean;
  className?: string;
  suffix?: string;
}) {
  const rounded = Math.round(average * 2) / 2;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <div className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "size-4",
              i <= Math.floor(rounded)
                ? "fill-warning text-warning"
                : i - 0.5 === rounded
                  ? "fill-warning/50 text-warning"
                  : "text-muted-foreground/40",
            )}
          />
        ))}
      </div>
      <span className="text-sm font-semibold tabular-nums">
        {formatNumber(average, { maximumFractionDigits: 1 })}
      </span>
      {showCount && (
        <span className="text-muted-foreground text-sm">
          ({formatNumber(count)}){suffix ? ` ${suffix}` : ""}
        </span>
      )}
      {label && <span className="text-muted-foreground text-xs">{label}</span>}
    </div>
  );
}
