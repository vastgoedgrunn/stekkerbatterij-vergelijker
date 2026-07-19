import { formatDate } from "@/lib/format";
import { formatPriceCheckedRelative } from "@/features/offers-pricing/offer-freshness";

export function PriceCheckedLabel({ checkedAt }: { checkedAt: string | null }) {
  if (!checkedAt) return null;
  const relative = formatPriceCheckedRelative(checkedAt);
  return (
    <p className="text-muted-foreground text-xs">
      {relative ?? `Prijs gecontroleerd op ${formatDate(checkedAt)}`}
    </p>
  );
}
