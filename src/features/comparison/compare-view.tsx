import Image from "next/image";
import Link from "next/link";
import { BatteryCharging, Check, Minus, Trophy } from "lucide-react";
import { RatingStars } from "@/components/patterns/rating-stars";
import { OfferLink } from "@/features/offers-pricing/offer-link";
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
      <div className="flex justify-center">
        <RatingStars average={p.rating.average} count={p.rating.count} showCount={false} />
      </div>
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
    <div className="border-border bg-card overflow-x-auto rounded-2xl border shadow-[var(--shadow-xs)]">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th
              className="bg-card sticky left-0 z-10 w-36 p-4 text-left align-bottom sm:w-44"
              scope="col"
            >
              <span className="sr-only">Kenmerk</span>
            </th>
            {products.map((p) => {
              const imageUrl = getPublicImageUrl(p.imagePath);
              return (
                <th key={p.id} scope="col" className="min-w-48 p-4 align-bottom">
                  <div className="from-accent/50 to-muted relative mx-auto flex aspect-square max-w-32 items-center justify-center rounded-2xl bg-gradient-to-br">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={p.name}
                        fill
                        sizes="128px"
                        className="object-contain p-2"
                      />
                    ) : (
                      <BatteryCharging className="text-primary/25 size-10" aria-hidden />
                    )}
                  </div>
                  <p className="text-muted-foreground mt-3 text-xs font-semibold tracking-wide uppercase">
                    {p.brand.name}
                  </p>
                  <Link href={`/batterijen/${p.slug}`} className="hover:text-primary font-semibold">
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
                <th
                  scope="row"
                  className="bg-card text-muted-foreground sticky left-0 z-10 p-4 text-left text-sm font-medium"
                >
                  {row.label}
                </th>
                {products.map((p, i) => (
                  <td
                    key={p.id}
                    className={cn(
                      "p-4 text-center text-sm",
                      best === i && "bg-primary/10 text-foreground font-bold",
                    )}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {best === i && row.highlight !== "none" && (
                        <Trophy className="text-primary size-3.5" aria-label="Beste" />
                      )}
                      {row.render(p)}
                    </span>
                  </td>
                ))}
              </tr>
            );
          })}
          <tr className="border-border border-t">
            <td className="bg-card sticky left-0 z-10 p-4" />
            {products.map((p) => {
              const bestOffer = [...p.offers].sort((a, b) => a.priceCents - b.priceCents)[0];
              return (
                <td key={p.id} className="space-y-2 p-4 text-center">
                  {bestOffer?.affiliateUrl ? (
                    <>
                      <p className="text-sm font-bold">{formatPrice(bestOffer.priceCents)}</p>
                      <p className="text-muted-foreground text-xs">bij {bestOffer.merchantName}</p>
                      <OfferLink
                        offerId={bestOffer.id}
                        productId={p.id}
                        merchant={bestOffer.merchantName}
                        sponsored={bestOffer.isSponsored}
                        estimatedCommissionCents={bestOffer.estimatedCommissionCents}
                        placement="compare"
                        size="sm"
                        className="w-full"
                      >
                        Naar {bestOffer.merchantName}
                      </OfferLink>
                    </>
                  ) : (
                    <Link
                      href={`/batterijen/${p.slug}`}
                      className={cn(buttonVariants({ size: "sm" }))}
                    >
                      Bekijk details
                    </Link>
                  )}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
