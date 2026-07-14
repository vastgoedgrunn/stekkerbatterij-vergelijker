import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

interface RatingStarsProps {
  average: number | null;
  count: number;
  showCount?: boolean;
  className?: string;
}

export function RatingStars({ average, count, showCount = true, className }: RatingStarsProps) {
  const value = average ?? 0;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "size-4",
              i <= Math.round(value) ? "fill-warning text-warning" : "text-muted-foreground/40",
            )}
          />
        ))}
      </div>
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
