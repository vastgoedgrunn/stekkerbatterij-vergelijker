import Image from "next/image";
import Link from "next/link";
import { BatteryCharging, Check, Minus, Trophy } from "lucide-react";
import { ProductRatingDisplay } from "@/components/patterns/product-rating-display";
import { OfferLink } from "@/features/offers-pricing/offer-link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatNumber, formatPrice } from "@/lib/format";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { productDetailPath } from "@/features/products/product-paths";
import type { ProductDetail } from "@/features/products/types";

type Highlight = "max" | "min" | "none";

interface Row {
  label: string;
  render: (p: ProductDetail) => React.ReactNode;
  value: (p: ProductDetail) => number | null;
  highlight: Highlight;
}

const baseRows: Row[] = [
  {
    label: "Laagste prijs",
    render: (p) => (p.lowestPriceCents !== null ? formatPrice(p.lowestPriceCents) : "-"),
    value: (p) => p.lowestPriceCents,
    highlight: "min",
  },
  {
    label: "Capaciteit",
    render: (p) => (p.capacityKwh !== null ? `${formatNumber(p.capacityKwh)} kWh` : "-"),
    value: (p) => p.capacityKwh,
    highlight: "max",
  },
  {
    label: "Vermogen",
    render: (p) => (p.powerKw !== null ? `${formatNumber(p.powerKw)} kW` : "-"),
    value: (p) => p.powerKw,
    highlight: "max",
  },
  {
    label: "Levensduur",
    render: (p) => (p.cycles !== null ? `${formatNumber(p.cycles)} cycli` : "-"),
    value: (p) => p.cycles,
    highlight: "max",
  },
  {
    label: "Garantie",
    render: (p) => (p.warrantyYears !== null ? `${p.warrantyYears} jaar` : "-"),
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
        <ProductRatingDisplay
          rating={p.rating}
          marketScore={p.marketScore}
          showCount={false}
          showSource={false}
        />
      </div>
    ),
    value: (p) =>
      p.rating.average !== null && p.rating.count > 0
        ? p.rating.average
        : (p.marketScore?.average ?? null),
    highlight: "max",
  },
];

function installationSpec(product: ProductDetail): string | null {
  const match = product.specs.find((s) =>
    /installatie|montage|plaatsing/i.test(`${s.key} ${s.label}`),
  );
  return match ? match.value : null;
}

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
  const primaryType = products[0]?.productType ?? "plug_in";
  const mixed = products.some((p) => p.productType !== primaryType);
  const comparable = mixed ? products.filter((p) => p.productType === primaryType) : products;

  const showInstallation = comparable.some((p) => installationSpec(p) !== null);
  const rows: Row[] = [
    ...baseRows.filter((row) => {
      if (row.label === "Laagste prijs" && primaryType === "fixed") return false;
      return true;
    }),
    ...(showInstallation
      ? [
          {
            label: "Installatie",
            render: (p: ProductDetail) => installationSpec(p) ?? "-",
            value: () => null,
            highlight: "none" as const,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-3">
      {mixed && (
        <p className="text-muted-foreground border-warning/30 bg-warning/5 rounded-xl border px-4 py-3 text-sm">
          Je vergelijkt alleen producten van hetzelfde type. Gemengde selecties zijn gefilterd naar{" "}
          {primaryType === "fixed" ? "vaste thuisbatterijen" : "stekkerbatterijen"}.
        </p>
      )}
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
              {comparable.map((p) => {
                const imageUrl = getPublicImageUrl(p.imagePath);
                const href = productDetailPath(p.slug, p.productType);
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
                    <Link href={href} className="hover:text-primary font-semibold">
                      {p.name}
                    </Link>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const best = bestIndex(comparable, row);
              return (
                <tr key={row.label} className="border-border border-t">
                  <th
                    scope="row"
                    className="bg-card text-muted-foreground sticky left-0 z-10 p-4 text-left text-sm font-medium"
                  >
                    {row.label}
                  </th>
                  {comparable.map((p, i) => (
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
              {comparable.map((p) => {
                const href = productDetailPath(p.slug, p.productType);
                const bestOffer = [...p.offers]
                  .filter((o) => o.affiliateUrl)
                  .sort((a, b) => a.priceCents - b.priceCents)[0];
                return (
                  <td key={p.id} className="space-y-2 p-4 text-center">
                    {p.productType === "fixed" ? (
                      <Link href={href} className={cn(buttonVariants({ size: "sm" }))}>
                        Bekijk en vraag offerte
                      </Link>
                    ) : bestOffer?.affiliateUrl ? (
                      <>
                        <p className="text-sm font-bold">{formatPrice(bestOffer.priceCents)}</p>
                        <p className="text-muted-foreground text-xs">
                          bij {bestOffer.merchantName}
                        </p>
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
                      <Link href={href} className={cn(buttonVariants({ size: "sm" }))}>
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
    </div>
  );
}
