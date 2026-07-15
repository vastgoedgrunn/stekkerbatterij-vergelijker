import { Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { OfferLink } from "@/features/offers-pricing/offer-link";
import { PriceCheckedLabel } from "@/features/offers-pricing/price-checked-label";
import { AddToCartButton } from "@/features/checkout/add-to-cart-button";
import { featureFlags } from "@/config/feature-flags";
import type { ProductOffer } from "@/features/products/types";
import type { StockStatus } from "@/lib/db/database.types";

/** Productinfo die nodig is om een self-aanbieding in de winkelmand te leggen. */
export interface OfferTableProduct {
  id: string;
  slug: string;
  name: string;
  brandName: string | null;
  imagePath: string | null;
  supplierId: string | null;
  sellable: boolean;
}

const stockLabels: Record<
  StockStatus,
  { label: string; variant: "success" | "warning" | "muted" }
> = {
  in_stock: { label: "Op voorraad", variant: "success" },
  preorder: { label: "Pre-order", variant: "warning" },
  out_of_stock: { label: "Uitverkocht", variant: "muted" },
  unknown: { label: "Onbekend", variant: "muted" },
};

export function OfferTable({
  offers,
  product,
}: {
  offers: ProductOffer[];
  product: OfferTableProduct;
}) {
  // Verkoopbaar via eigen shop wanneer product sellable is én checkout aan staat.
  const canSellSelf = featureFlags.checkout && product.sellable && product.supplierId !== null;

  if (offers.length === 0) {
    return (
      <p className="text-muted-foreground border-border rounded-2xl border border-dashed p-6 text-sm">
        Er zijn nog geen aanbieders bekend voor dit product.
      </p>
    );
  }

  const sorted = [...offers].sort((a, b) => a.priceCents - b.priceCents);
  const cheapest = sorted[0]?.priceCents;

  return (
    <ul className="space-y-3">
      {sorted.map((offer) => {
        const stock = stockLabels[offer.stockStatus];
        const isBest = offer.priceCents === cheapest;
        return (
          <li
            key={offer.id}
            className={cn(
              "border-border bg-card flex flex-col gap-4 rounded-2xl border p-4 transition-shadow sm:flex-row sm:items-center",
              isBest && "border-primary/40 ring-primary/15 shadow-[var(--shadow-sm)] ring-2",
            )}
          >
            <div className="flex flex-1 items-center gap-3">
              <span className="bg-muted text-foreground flex size-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold">
                {offer.merchantName.charAt(0)}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{offer.merchantName}</span>
                  {isBest && <Badge variant="default">Beste prijs</Badge>}
                  {offer.isSelf && <Badge variant="secondary">Onze prijs</Badge>}
                  {offer.isSponsored && <Badge variant="muted">Advertentie</Badge>}
                </div>
                <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <Badge variant={stock.variant}>{stock.label}</Badge>
                  {offer.deliveryDays !== null && (
                    <span className="inline-flex items-center gap-1">
                      <Truck className="size-3.5" /> {offer.deliveryDays} werkdagen
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <div className="text-right">
                <span className="text-xl font-bold tracking-tight">
                  {formatPrice(offer.priceCents)}
                </span>
                <PriceCheckedLabel checkedAt={offer.lastCheckedAt} />
              </div>
              {offer.affiliateUrl ? (
                <OfferLink
                  offerId={offer.id}
                  productId={product.id}
                  merchant={offer.merchantName}
                  sponsored={offer.isSponsored}
                  estimatedCommissionCents={offer.estimatedCommissionCents}
                  placement="pdp_table"
                >
                  Naar {offer.merchantName}
                </OfferLink>
              ) : canSellSelf && offer.isSelf ? (
                <AddToCartButton
                  item={{
                    productId: product.id,
                    offerId: offer.id,
                    slug: product.slug,
                    name: product.name,
                    brandName: product.brandName,
                    imagePath: product.imagePath,
                    unitPriceCents: offer.priceCents,
                  }}
                />
              ) : (
                <span className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                  Koop bij ons
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
