"use client";

import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/observability/analytics";

/**
 * Affiliate-/aanbiederlink die de primaire conversie-KPI meet:
 * uitgaande kliks naar een aanbieder ("offer_clicked"). Client component zodat
 * we het event kunnen afvuren; de omliggende tabel blijft een server component.
 *
 * De link wijst naar onze eigen redirect `/api/go/{offerId}` die de klik
 * server-side registreert, tracking-parameters toevoegt en doorstuurt naar de
 * aanbieder. Zo blijft de affiliate-URL uit de HTML en meten we elke klik.
 */
export function OfferLink({
  offerId,
  productId,
  merchant,
  sponsored,
  estimatedCommissionCents,
  size = "sm",
  className,
  children,
}: {
  offerId: string;
  productId: string;
  merchant: string;
  sponsored: boolean;
  estimatedCommissionCents?: number | null;
  size?: "sm" | "lg";
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
            ...(estimatedCommissionCents != null ? { estimatedCommissionCents } : {}),
          },
        })
      }
      className={cn(buttonVariants({ size }), className)}
    >
      {children}
      <ExternalLink className="size-4" />
    </a>
  );
}
