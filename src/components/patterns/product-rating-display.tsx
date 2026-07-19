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
    const scopeHint = marketScore.scope === "brand" ? "merkscore" : "productscore";
    return (
      <div className={cn("flex flex-col gap-0.5", className)}>
        <RatingBlock
          average={marketScore.average}
          count={marketScore.count}
          label={`Marktscore (${scopeHint})`}
          showCount={showCount}
        />
        {showSource && (
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

  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-label="Nog geen reviews">
      <div className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="text-muted-foreground/40 size-4" />
        ))}
      </div>
      {showCount && <span className="text-muted-foreground text-sm">Nog geen reviews</span>}
    </div>
  );
}

function RatingBlock({
  average,
  count,
  label,
  showCount,
  className,
}: {
  average: number;
  count: number;
  label: string | null;
  showCount: boolean;
  className?: string;
}) {
  const ariaLabel = label
    ? `${label}: ${formatNumber(average, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} van 5 op basis van ${count} reviews (externe bron)`
    : `Beoordeling: ${formatNumber(average, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} van 5 op basis van ${count} ${count === 1 ? "review" : "reviews"}`;

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {label && <span className="text-muted-foreground text-xs font-medium">{label}</span>}
      <div className="flex items-center gap-1.5" aria-label={ariaLabel}>
        <div className="flex" aria-hidden>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={cn(
                "size-4",
                i <= Math.round(average) ? "fill-warning text-warning" : "text-muted-foreground/40",
              )}
            />
          ))}
        </div>
        {showCount && (
          <span className="text-muted-foreground text-sm">
            <span className="text-foreground font-medium">
              {formatNumber(average, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>{" "}
            ({count})
          </span>
        )}
      </div>
    </div>
  );
}
