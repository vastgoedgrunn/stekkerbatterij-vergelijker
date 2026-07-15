"use client";

import * as React from "react";
import { StickyOfferBar } from "@/features/offers-pricing/sticky-offer-bar";
import type { ProductOffer } from "@/features/products/types";

/** Wrapt het PDP-prijsblok en toont een sticky mobile CTA wanneer het blok uit beeld scrollt. */
export function PdpStickyOfferAnchor({
  productId,
  productName,
  bestOffer,
  children,
}: {
  productId: string;
  productName: string;
  bestOffer: ProductOffer | undefined;
  children: React.ReactNode;
}) {
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={sentinelRef}>{children}</div>
      {bestOffer && (
        <StickyOfferBar
          productId={productId}
          productName={productName}
          bestOffer={bestOffer}
          sentinelRef={sentinelRef}
        />
      )}
    </>
  );
}
