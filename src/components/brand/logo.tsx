import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Officiële merk-assets (transparante PNG's in `public/images/brand`).
 * Één bron van waarheid: wil je het logo ooit vervangen, doe dat hier.
 *
 * Het woordmerk "Stekkerbatterij" is donker. Op donkere achtergronden
 * (dark mode header/footer) zou die tekst wegvallen; daarom is er een
 * dark-variant waarin die tekst licht is gemaakt terwijl het groene icoon
 * en "Vergelijker" groen blijven. We tonen light/dark via de `dark:`-class.
 */
const LOGO = {
  full: "/images/brand/logo.png",
  fullDark: "/images/brand/logo-dark.png",
  mark: "/images/brand/logo-mark.png",
  // Intrinsieke verhouding van het horizontale lockup (~3.26:1).
  width: 786,
  height: 241,
} as const;

/**
 * Icoon-only merkteken (groene batterij met stekker + bliksem).
 * Handig waar het volledige woordmerk niet past.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src={LOGO.mark}
      alt="Stekkerbatterij Vergelijker"
      width={279}
      height={279}
      className={cn("size-8", className)}
    />
  );
}

/**
 * Volledig logo (icoon + woordmerk). Boven de vouw (header) `priority`.
 * De hoogte stuur je via `className` (default `h-7 sm:h-8`); de breedte
 * schaalt automatisch mee zodat de verhouding klopt op retina en mobiel.
 */
export function Logo({ className, priority = false }: { className?: string; priority?: boolean }) {
  const shared = {
    width: LOGO.width,
    height: LOGO.height,
    priority,
    sizes: "(max-width: 640px) 170px, 210px",
  } as const;

  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        {...shared}
        src={LOGO.full}
        alt="Stekkerbatterij Vergelijker"
        className="h-7 w-auto sm:h-8 dark:hidden"
      />
      <Image
        {...shared}
        src={LOGO.fullDark}
        alt="Stekkerbatterij Vergelijker"
        className="hidden h-7 w-auto sm:h-8 dark:block"
      />
    </span>
  );
}
