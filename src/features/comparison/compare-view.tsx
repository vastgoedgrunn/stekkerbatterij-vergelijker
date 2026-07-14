import Image from "next/image";
import Link from "next/link";
import { BatteryCharging, Check, Minus } from "lucide-react";
import { RatingStars } from "@/components/patterns/rating-stars";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatNumber, formatPrice } from "@/lib/format";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import type { ProductDetail } from "@/features/products/types";

type Highlight = "max" | "min" | "none";

interface Row {
  label: string;
  render: (p: ProductDetail) => React.ReactNode;
  value: (p: ProductDetail) => number | null;
  highlight: Highlight;
}

const rows: Row[] = [
  {
    label: "Laagste prijs",
    render: (p) => (p.lowestPriceCents !== null ? formatPrice(p.lowestPriceCents) : "—"),
    value: (p) => p.lowestPriceCents,
    highlight: "min",
  },
  {
    label: "Capaciteit",
    render: (p) => (p.capacityKwh !== null ? `${formatNumber(p.capacityKwh)} kWh` : "—"),
    value: (p) => p.capacityKwh,
    highlight: "max",
  },
  {
    label: "Vermogen",
    render: (p) => (p.powerKw !== null ? `${formatNumber(p.powerKw)} kW` : "—"),
    value: (p) => p.powerKw,
    highlight: "max",
  },
  {
    label: "Levensduur",
    render: (p) => (p.cycles !== null ? `${formatNumber(p.cycles)} cycli` : "—"),
    value: (p) => p.cycles,
    highlight: "max",
  },
  {
    label: "Garantie",
    render: (p) => (p.warrantyYears !== null ? `${p.warrantyYears} jaar` : "—"),
    value: (p) => p.warrantyYears,
    highlight: "max",
  },
  {
    label: "Uitbreidbaar",
    render: (p) =>
      p.expandable ? (
        <Check className="text-success mx-auto size-5" aria-label="Ja" />
      ) : (
        <Minus className="text-muted-foreground mx-auto size-5" aria-label="Nee" />
      ),
    value: (p) => (p.expandable ? 1 : 0),
    highlight: "none",
  },
  {
    label: "Beoordeling",
    render: (p) => (
      <RatingStars average={p.rating.average} count={p.rating.count} showCount={false} />
    ),
    value: (p) => p.rating.average,
    highlight: "max",
  },
];

function bestIndex(products: ProductDetail[], row: Row): number | null {
  if (row.highlight === "none") return null;
  let best: number | null = null;
  let bestVal: number | null = null;
  products.forEach((p, i) => {
    const v = row.value(p);
    if (v === null) return;
    if (bestVal === null || (row.highlight === "max" ? v > bestVal : v < bestVal)) {
      bestVal = v;
      best = i;
    }
  });
  return best;
}

export function CompareView({ products }: { products: ProductDetail[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-40 p-3 text-left align-bottom" scope="col">
              <span className="sr-only">Kenmerk</span>
            </th>
            {products.map((p) => {
              const imageUrl = getPublicImageUrl(p.imagePath);
              return (
                <th key={p.id} scope="col" className="min-w-48 p-3 align-bottom">
                  <div className="bg-muted relative mx-auto flex aspect-4/3 max-w-40 items-center justify-center rounded-lg">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={p.name}
                        fill
                        sizes="160px"
                        className="object-contain p-2"
                      />
                    ) : (
                      <BatteryCharging className="text-muted-foreground/40 size-10" aria-hidden />
                    )}
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs font-medium tracking-wide uppercase">
                    {p.brand.name}
                  </p>
                  <Link href={`/batterijen/${p.slug}`} className="font-semibold hover:underline">
                    {p.name}
                  </Link>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const best = bestIndex(products, row);
            return (
              <tr key={row.label} className="border-border border-t">
                <th scope="row" className="text-muted-foreground p-3 text-left text-sm font-medium">
                  {row.label}
                </th>
                {products.map((p, i) => (
                  <td
                    key={p.id}
                    className={cn(
                      "p-3 text-center text-sm",
                      best === i && "bg-success/10 font-semibold",
                    )}
                  >
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            );
          })}
          <tr className="border-border border-t">
            <td className="p-3" />
            {products.map((p) => (
              <td key={p.id} className="p-3 text-center">
                <Link href={`/batterijen/${p.slug}`} className={cn(buttonVariants({ size: "sm" }))}>
                  Bekijk
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
