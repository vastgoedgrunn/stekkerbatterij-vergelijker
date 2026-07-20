"use client";

import { OfferLink } from "@/features/offers-pricing/offer-link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import type { ShopBundle, ShopCatalogItem } from "./catalog";
import type { ShopOfferRow } from "./queries";

export function ShopBundleCard({
  bundle,
  items,
  offers,
}: {
  bundle: ShopBundle;
  items: ShopCatalogItem[];
  offers: Record<string, ShopOfferRow | undefined>;
}) {
  const lines = bundle.itemSlugs
    .map((slug) => {
      const item = items.find((i) => i.slug === slug);
      const offer = offers[slug];
      const qty = bundle.quantities?.[slug] ?? 1;
      if (!item) return null;
      return { item, offer, qty };
    })
    .filter(Boolean) as {
    item: ShopCatalogItem;
    offer: ShopOfferRow | undefined;
    qty: number;
  }[];

  const totalCents = lines.reduce((sum, line) => {
    if (!line.offer) return sum;
    return sum + line.offer.priceCents * line.qty;
  }, 0);
  const allReady = lines.every((line) => line.offer);

  return (
    <article
      id={bundle.slug}
      className={`border-border/80 bg-card flex scroll-mt-28 flex-col overflow-hidden rounded-2xl border shadow-[var(--shadow-sm)] ${
        bundle.highlight ? "ring-primary/30 ring-2" : ""
      }`}
    >
      <div className="from-primary/10 to-accent/30 border-border/60 border-b bg-gradient-to-br px-4 py-5 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-bold tracking-tight">{bundle.name}</h3>
          {bundle.highlight && <Badge variant="highlight">Populair</Badge>}
        </div>
        <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{bundle.summary}</p>
        {allReady && totalCents > 0 && (
          <p className="mt-3 text-base font-semibold">
            Vanaf {formatPrice(totalCents)}
            <span className="text-muted-foreground ml-1 text-xs font-normal">incl. btw</span>
          </p>
        )}
      </div>

      <ul className="divide-border/60 flex flex-1 flex-col divide-y">
        {lines.map(({ item, offer, qty }) => (
          <li
            key={`${bundle.slug}-${item.slug}-${qty}`}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <div className="min-w-0">
              <p className="font-medium">
                {qty > 1 ? `${qty}× ` : ""}
                {item.name}
              </p>
              <p className="text-muted-foreground text-xs">{item.brand}</p>
              {offer && (
                <p className="mt-1 text-sm font-semibold">
                  {qty > 1
                    ? `${qty}× ${formatPrice(offer.priceCents)}`
                    : formatPrice(offer.priceCents)}
                </p>
              )}
            </div>
            {offer ? (
              <OfferLink
                offerId={offer.offerId}
                productId={offer.productId}
                merchant={offer.merchantName}
                sponsored={false}
                estimatedCommissionCents={offer.estimatedCommissionCents}
                placement="shop"
                size="sm"
                variant="outline"
                className="w-full shrink-0 justify-center sm:w-auto"
              >
                {qty > 1 ? `Bestel ${qty}×` : "Bestellen"}
              </OfferLink>
            ) : (
              <span className="text-muted-foreground text-sm">Niet leverbaar</span>
            )}
          </li>
        ))}
      </ul>
    </article>
  );
}
