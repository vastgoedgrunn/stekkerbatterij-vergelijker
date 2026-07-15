"use client";

import * as React from "react";
import { OfferLink } from "@/features/offers-pricing/offer-link";
import { useCompare } from "@/features/comparison/compare-store";
import { formatPrice } from "@/lib/format";
import type { ProductOffer } from "@/features/products/types";

interface StickyOfferBarProps {
  productId: string;
  productName: string;
  bestOffer: ProductOffer;
  /** Ref naar het hero-prijsblok; sticky bar verschijnt wanneer dit uit beeld scrollt. */
  sentinelRef: React.RefObject<HTMLElement | null>;
}

const STICKY_ALONE = "calc(4.75rem + env(safe-area-inset-bottom, 0px))";
const STICKY_ABOVE_COMPARE = "4.75rem";

export function StickyOfferBar({
  productId,
  productName,
  bestOffer,
  sentinelRef,
}: StickyOfferBarProps) {
  const [visible, setVisible] = React.useState(false);
  const { slugs } = useCompare();
  const compareActive = slugs.length > 0;
  const show = Boolean(bestOffer.affiliateUrl && visible);

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

  React.useEffect(() => {
    if (!show) {
      document.documentElement.style.setProperty("--sticky-offer-space", "0px");
      return;
    }
    document.documentElement.style.setProperty(
      "--sticky-offer-space",
      compareActive ? STICKY_ABOVE_COMPARE : STICKY_ALONE,
    );
    return () => {
      document.documentElement.style.setProperty("--sticky-offer-space", "0px");
    };
  }, [show, compareActive]);

  if (!show) return null;

  return (
    <div
      className="border-border bg-card/95 fixed inset-x-0 z-40 border-t p-3 shadow-[var(--shadow-xl)] backdrop-blur-xl md:hidden"
      style={{
        bottom: "var(--compare-bar-space, 0px)",
        paddingBottom: compareActive ? "0.75rem" : "max(0.75rem, env(safe-area-inset-bottom))",
      }}
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
