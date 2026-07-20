import { cn } from "@/lib/utils";

/**
 * Korte, klantvriendelijke toelichting bij commerciële links (NL).
 * Geen jargon; footer bevat de algemene sitevermelding.
 */
export function AffiliateDisclosure({ className }: { className?: string }) {
  return (
    <p className={cn("text-muted-foreground text-xs leading-relaxed", className)}>
      Prijzen zijn incl. btw en kunnen wijzigen. De prijs die je bij afronden ziet, is altijd
      leidend. Bij aankoop via onze links kunnen wij een kleine vergoeding ontvangen, zonder extra
      kosten voor jou.
    </p>
  );
}
