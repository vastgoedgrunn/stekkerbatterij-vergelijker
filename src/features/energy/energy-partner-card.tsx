"use client";

import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { trackEvent } from "@/lib/observability/analytics";

export function EnergyPartnerCard({
  slug,
  name,
  description,
  commissionMin,
  commissionMax,
}: {
  slug: string;
  name: string;
  description: string | null;
  commissionMin: number | null;
  commissionMax: number | null;
}) {
  const commissionLabel =
    commissionMin != null && commissionMax != null
      ? `${formatPrice(commissionMin)} – ${formatPrice(commissionMax)} CPA`
      : commissionMin != null
        ? `vanaf ${formatPrice(commissionMin)} CPA`
        : null;

  return (
    <article className="border-border bg-card flex flex-col rounded-2xl border p-6 shadow-[var(--shadow-sm)]">
      <h3 className="text-lg font-bold">{name}</h3>
      {description && (
        <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">{description}</p>
      )}
      {commissionLabel && (
        <p className="text-muted-foreground mt-3 text-xs">Partnervergoeding: {commissionLabel}</p>
      )}
      <a
        href={`/api/go/energy/${slug}`}
        target="_blank"
        rel="nofollow sponsored noopener"
        onClick={() =>
          trackEvent({ name: "energy_cta_clicked", props: { placement: "energie", partner: slug } })
        }
        className={cn(buttonVariants({ className: "mt-5 w-full" }))}
      >
        Bekijk aanbod <ExternalLink className="size-4" />
      </a>
    </article>
  );
}
