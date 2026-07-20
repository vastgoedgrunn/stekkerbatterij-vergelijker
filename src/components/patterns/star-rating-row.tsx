import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarFill = "full" | "half" | "empty";

function starFill(index: number, roundedHalf: number): StarFill {
  if (index <= Math.floor(roundedHalf)) return "full";
  if (index - 0.5 === roundedHalf) return "half";
  return "empty";
}

function StarGlyph({ fill, className }: { fill: StarFill; className?: string }) {
  if (fill === "half") {
    return (
      <span className={cn("relative inline-block size-4", className)} aria-hidden>
        <Star className="text-muted-foreground/40 absolute inset-0 size-4" />
        <Star
          className="fill-warning text-warning absolute inset-0 size-4"
          style={{ clipPath: "inset(0 50% 0 0)" }}
        />
      </span>
    );
  }

  return (
    <Star
      className={cn(
        "size-4",
        fill === "full" ? "fill-warning text-warning" : "text-muted-foreground/40",
        className,
      )}
      aria-hidden
    />
  );
}

/** Vijf sterren met echte half-fill (afgerond op 0,5). */
export function StarRatingRow({
  average,
  className,
}: {
  average: number;
  className?: string;
}) {
  const rounded = Math.round(average * 2) / 2;
  return (
    <div className={cn("flex", className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarGlyph key={i} fill={starFill(i, rounded)} />
      ))}
    </div>
  );
}
