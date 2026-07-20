import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { StarRatingRow } from "@/components/patterns/star-rating-row";

interface RatingStarsProps {
  average: number | null;
  count: number;
  showCount?: boolean;
  className?: string;
}

export function RatingStars({ average, count, showCount = true, className }: RatingStarsProps) {
  const value = average ?? 0;

  const ariaLabel =
    average !== null
      ? `Beoordeling: ${formatNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} van 5${count > 0 ? ` op basis van ${count} ${count === 1 ? "review" : "reviews"}` : ""}`
      : "Nog geen reviews";

  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-label={ariaLabel}>
      {average !== null ? (
        <StarRatingRow average={value} />
      ) : (
        <StarRatingRow average={0} />
      )}
      {showCount && (
        <span className="text-muted-foreground text-sm">
          {average !== null ? (
            <>
              <span className="text-foreground font-medium">
                {formatNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>{" "}
              ({count})
            </>
          ) : (
            "Nog geen reviews"
          )}
        </span>
      )}
    </div>
  );
}
