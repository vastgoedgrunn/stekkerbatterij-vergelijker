import { formatPrice } from "@/lib/format";
import { featureFlags } from "@/config/feature-flags";
import type { ProductOffer } from "@/features/products/types";

/**
 * Toont transparante prijsvergelijking tussen eigen shop en affiliate-aanbieders
 * voor dropship-hero producten (plan fase 4).
 */
export function DropshipPriceHint({
  sellable,
  offers,
}: {
  sellable: boolean;
  offers: ProductOffer[];
}) {
  if (!sellable) return null;

  const selfOffer = offers.find((o) => o.isSelf);
  const affiliateOffers = offers
    .filter((o) => !o.isSelf && o.affiliateUrl)
    .sort((a, b) => a.priceCents - b.priceCents);
  const cheapestAffiliate = affiliateOffers[0];

  if (!selfOffer) return null;

  if (featureFlags.checkout) {
    if (!cheapestAffiliate) return null;
    return (
      <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
        {cheapestAffiliate.priceCents < selfOffer.priceCents ? (
          <>
            Via {cheapestAffiliate.merchantName} vanaf{" "}
            <span className="text-foreground font-medium">
              {formatPrice(cheapestAffiliate.priceCents)}
            </span>
            {" · "}
            Bij ons{" "}
            <span className="text-foreground font-medium">{formatPrice(selfOffer.priceCents)}</span>
          </>
        ) : (
          <>
            Laagste prijs bij ons:{" "}
            <span className="text-foreground font-medium">{formatPrice(selfOffer.priceCents)}</span>
            {cheapestAffiliate && (
              <>
                {" · "}
                {cheapestAffiliate.merchantName} {formatPrice(cheapestAffiliate.priceCents)}
              </>
            )}
          </>
        )}
      </p>
    );
  }

  return (
    <p className="text-muted-foreground mt-2 text-xs">
      Direct bij ons bestellen: binnenkort beschikbaar. Huidige shop-prijs{" "}
      <span className="text-foreground font-medium">{formatPrice(selfOffer.priceCents)}</span>
      {cheapestAffiliate && (
        <>
          {" "}
          · via {cheapestAffiliate.merchantName} vanaf {formatPrice(cheapestAffiliate.priceCents)}
        </>
      )}
    </p>
  );
}
