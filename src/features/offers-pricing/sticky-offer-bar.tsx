"use client";

import * as React from "react";
import { OfferLink } from "@/features/offers-pricing/offer-link";
import { formatPrice } from "@/lib/format";
import type { ProductOffer } from "@/features/products/types";

interface StickyOfferBarProps {
  productId: string;
  productName: string;
  bestOffer: ProductOffer;
  /** Ref naar het hero-prijsblok; sticky bar verschijnt wanneer dit uit beeld scrollt. */
  sentinelRef: React.RefObject<HTMLElement | null>;
}

export function StickyOfferBar({
  productId,
  productName,
  bestOffer,
  sentinelRef,
}: StickyOfferBarProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry?.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sentinelRef]);

  if (!bestOffer.affiliateUrl || !visible) return null;

  return (
    <div
      className="border-border bg-card/95 fixed inset-x-0 bottom-0 z-40 border-t p-3 shadow-[var(--shadow-xl)] backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{productName}</p>
          <p className="text-lg font-bold tracking-tight">{formatPrice(bestOffer.priceCents)}</p>
        </div>
        <OfferLink
          offerId={bestOffer.id}
          productId={productId}
          merchant={bestOffer.merchantName}
          sponsored={bestOffer.isSponsored}
          estimatedCommissionCents={bestOffer.estimatedCommissionCents}
          placement="sticky_mobile"
          size="sm"
          className="shrink-0"
        >
          Bekijk bij {bestOffer.merchantName}
        </OfferLink>
      </div>
    </div>
  );
}
