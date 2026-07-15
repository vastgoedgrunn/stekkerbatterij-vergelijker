"use client";

import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/observability/analytics";

export type OfferLinkPlacement =
  "pdp_hero" | "pdp_table" | "sticky_mobile" | "wizard" | "compare" | "catalog_card";

/**
 * Affiliate-/aanbiederlink die de primaire conversie-KPI meet:
 * uitgaande kliks naar een aanbieder ("offer_clicked"). Client component zodat
 * we het event kunnen afvuren; de omliggende tabel blijft een server component.
 */
export function OfferLink({
  offerId,
  productId,
  merchant,
  sponsored,
  estimatedCommissionCents,
  placement,
  size = "sm",
  variant = "primary",
  className,
  children,
}: {
  offerId: string;
  productId: string;
  merchant: string;
  sponsored: boolean;
  estimatedCommissionCents?: number | null;
  placement?: OfferLinkPlacement;
  size?: "sm" | "lg";
  variant?: "primary" | "outline";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={`/api/go/${offerId}`}
      target="_blank"
      rel={sponsored ? "sponsored nofollow noopener" : "nofollow noopener"}
      onClick={() =>
        trackEvent({
          name: "offer_clicked",
          props: {
            productId,
            merchant,
            offerId,
            ...(placement ? { placement } : {}),
            ...(estimatedCommissionCents != null ? { estimatedCommissionCents } : {}),
          },
        })
      }
      className={cn(buttonVariants({ size, variant }), className)}
    >
      {children}
      <ExternalLink className="size-4" />
    </a>
  );
}
