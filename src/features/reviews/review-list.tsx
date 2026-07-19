import { RatingStars } from "@/components/patterns/rating-stars";
import { formatDate } from "@/lib/format";
import type { MarketScore } from "@/features/products/types";
import type { Review } from "./types";

export function ReviewList({
  reviews,
  marketScore,
}: {
  reviews: Review[];
  marketScore?: MarketScore | null;
}) {
  if (reviews.length === 0) {
    if (marketScore) {
      return (
        <p className="text-muted-foreground text-sm">
          Er staan nog geen eigen reviews op deze pagina. Boven zie je wel de externe score van{" "}
          {marketScore.sourceName}.
        </p>
      );
    }
    return (
      <p className="text-muted-foreground text-sm">
        Er zijn nog geen reviews voor dit product. Deel je ervaring als je wilt.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li key={review.id} className="border-border bg-card rounded-2xl border p-5">
          <div className="flex items-center justify-between gap-2">
            <RatingStars average={review.rating} count={0} showCount={false} />
            <time className="text-muted-foreground text-xs">{formatDate(review.createdAt)}</time>
          </div>
          {review.title && <p className="mt-3 font-semibold">{review.title}</p>}
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{review.body}</p>
        </li>
      ))}
    </ul>
  );
}
