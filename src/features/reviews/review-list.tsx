import { RatingStars } from "@/components/patterns/rating-stars";
import { formatDate } from "@/lib/format";
import type { Review } from "./types";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Er zijn nog geen reviews voor dit product. Wees de eerste die er een schrijft.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li key={review.id} className="border-border rounded-xl border p-4">
          <div className="flex items-center justify-between gap-2">
            <RatingStars average={review.rating} count={0} showCount={false} />
            <time className="text-muted-foreground text-xs">{formatDate(review.createdAt)}</time>
          </div>
          {review.title && <p className="mt-2 font-medium">{review.title}</p>}
          <p className="text-muted-foreground mt-1 text-sm">{review.body}</p>
        </li>
      ))}
    </ul>
  );
}
