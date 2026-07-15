import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Bekende winkellogo's als `/public/logos/{slug}.svg` of `.png`.
 * Nu nog leeg: we tonen een nette monogram-fallback. Zodra echte logo's
 * beschikbaar zijn, voeg je hier `slug -> pad` toe (geen verdere code nodig).
 */
const MERCHANT_LOGOS: Record<string, string> = {};

/**
 * Toont het winkellogo als dat bekend is, anders een verzorgd monogram
 * (eerste letter in een merk-getinte tegel). Consistent op productdetail,
 * vergelijker en sticky bar.
 */
export function MerchantLogo({
  slug,
  name,
  className,
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const logo = MERCHANT_LOGOS[slug];

  return (
    <span
      className={cn(
        "border-border/70 bg-card relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-[var(--shadow-xs)]",
        className,
      )}
    >
      {logo ? (
        <Image src={logo} alt={name} fill sizes="48px" className="object-contain p-1.5" />
      ) : (
        <span className="text-primary text-lg font-bold" aria-hidden>
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  );
}
