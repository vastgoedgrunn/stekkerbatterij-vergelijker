import { cn } from "@/lib/utils";

/**
 * Merk-icoon: een afgeronde "batterij"-tegel met een bliksem/blad-vorm.
 * Puur SVG met currentColor-accenten zodat het overal meeschaalt en
 * eenvoudig te hersteken/vervangen is.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logoTile" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-primary)" />
          <stop offset="1" stopColor="color-mix(in oklch, var(--color-primary) 70%, black)" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="34" height="34" rx="11" fill="url(#logoTile)" />
      {/* batterij-terminal-accent bovenaan */}
      <rect x="16" y="1.5" width="8" height="4" rx="2" fill="var(--color-primary)" opacity="0.9" />
      {/* bliksem die ook als blad leest */}
      <path
        d="M22.5 9.5 13.5 21.4c-.5.66-.03 1.6.8 1.6h4.35l-1.9 8.2c-.22.95 1 1.53 1.6.77l9.2-11.95c.5-.66.03-1.6-.8-1.6h-4.4l1.85-8.16c.22-.96-1.02-1.53-1.6-.76Z"
        fill="var(--color-primary-foreground)"
      />
    </svg>
  );
}

/**
 * Volledig logo: icoon + woordmerk. `compact` toont een kortere naam.
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="size-9" />
      <span className="flex flex-col leading-none">
        <span className="text-[0.95rem] font-bold tracking-tight">
          Stekkerbatterij
          {!compact && <span className="text-primary"> Vergelijker</span>}
        </span>
        {!compact && (
          <span className="text-muted-foreground text-[0.62rem] font-medium tracking-[0.14em] uppercase">
            Onafhankelijk vergelijken
          </span>
        )}
      </span>
    </span>
  );
}
