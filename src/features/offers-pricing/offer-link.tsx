"use client";

import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/observability/analytics";

/**
 * Affiliate-/aanbiederlink die de primaire conversie-KPI meet:
 * uitgaande kliks naar een aanbieder ("offer_clicked"). Client component zodat
 * we het event kunnen afvuren; de omliggende tabel blijft een server component.
 */
export function OfferLink({
  href,
  productId,
  merchant,
  sponsored,
  size = "sm",
  className,
  children,
}: {
  href: string;
  productId: string;
  merchant: string;
  sponsored: boolean;
  size?: "sm" | "lg";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel={sponsored ? "sponsored noopener" : "noopener"}
      onClick={() => trackEvent({ name: "offer_clicked", props: { productId, merchant } })}
      className={cn(buttonVariants({ size }), className)}
    >
      {children}
      <ExternalLink className="size-4" />
    </a>
  );
}
