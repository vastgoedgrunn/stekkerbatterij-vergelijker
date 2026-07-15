import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Verplichte affiliate-disclosure (NL) op pagina's met commerciële outbound links.
 */
export function AffiliateDisclosure({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "text-muted-foreground flex items-start gap-2 rounded-xl border border-dashed px-4 py-3 text-xs leading-relaxed",
        className,
      )}
    >
      <Info className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
      <span>
        Sommige links op deze pagina zijn affiliate-links. Als je via ons koopt, ontvangen wij
        mogelijk een vergoeding — zonder extra kosten voor jou. Prijzen controleren we regelmatig,
        maar de actuele prijs geldt altijd bij de aanbieder.
      </span>
    </p>
  );
}
