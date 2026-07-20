"use client";

import { OfferLink } from "@/features/offers-pricing/offer-link";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/patterns/product-image";
import { formatPrice } from "@/lib/format";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import type { ShopCatalogItem } from "./catalog";
import type { ShopOfferRow } from "./queries";

export function ShopProductCard({
  item,
  offer,
  quantity = 1,
}: {
  item: ShopCatalogItem;
  offer: ShopOfferRow | undefined;
  quantity?: number;
}) {
  const priceLabel = offer
    ? quantity > 1
      ? `${quantity}× ${formatPrice(offer.priceCents)}`
      : formatPrice(offer.priceCents)
    : null;
  const imageUrl = getPublicImageUrl(offer?.imagePath ?? null);

  return (
    <article
      id={item.slug}
      className="border-border/80 bg-card flex scroll-mt-28 flex-col overflow-hidden rounded-2xl border shadow-[var(--shadow-sm)]"
    >
      <ProductImage
        src={imageUrl}
        alt={item.name}
        aspect="card"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="rounded-none rounded-t-2xl border-0 border-b"
      />
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {item.brand}
          </p>
          <h3 className="mt-0.5 text-base leading-snug font-semibold sm:text-lg">{item.name}</h3>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">{item.summary}</p>
        <ul className="flex flex-wrap gap-1.5">
          {item.labels.map((label) => (
            <li key={label}>
              <Badge variant="muted">{label}</Badge>
            </li>
          ))}
        </ul>
        <div className="border-border/60 mt-auto flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {priceLabel ? (
              <>
                <p className="text-lg font-bold tracking-tight">{priceLabel}</p>
                <p className="text-muted-foreground text-xs">Incl. btw</p>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Prijs op aanvraag</p>
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
              variant="primary"
              className="w-full justify-center sm:w-auto"
            >
              {quantity > 1 ? `Bestel ${quantity}×` : "Bestellen"}
            </OfferLink>
          ) : (
            <span className="text-muted-foreground text-sm">Tijdelijk niet leverbaar</span>
          )}
        </div>
      </div>
    </article>
  );
}
