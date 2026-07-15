import { formatDate } from "@/lib/format";

export function PriceCheckedLabel({ checkedAt }: { checkedAt: string | null }) {
  if (!checkedAt) return null;
  return (
    <p className="text-muted-foreground text-xs">Prijs gecontroleerd op {formatDate(checkedAt)}</p>
  );
}
