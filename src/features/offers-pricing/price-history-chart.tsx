import { businessRules } from "@/config/business-rules";
import { formatDate, formatPrice } from "@/lib/format";
import type { PricePoint } from "@/features/products/types";

/**
 * Lichte SVG-lijngrafiek zonder externe chart-library (minder JS).
 * Server-gerenderd op basis van statische prijshistorie.
 */
export function PriceHistoryChart({ points }: { points: PricePoint[] }) {
  if (points.length < 2) {
    return (
      <p className="text-muted-foreground text-sm">
        Nog niet genoeg prijsgeschiedenis om een trend te tonen.
      </p>
    );
  }

  const width = 600;
  const height = 180;
  const padding = 24;

  const prices = points.map((p) => p.priceCents);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const x = (i: number) => padding + (i / (points.length - 1)) * (width - padding * 2);
  const y = (price: number) => padding + (1 - (price - min) / range) * (height - padding * 2);

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.priceCents)}`)
    .join(" ");
  const areaPath = `${linePath} L ${x(points.length - 1)} ${height - padding} L ${x(0)} ${height - padding} Z`;

  const lowest = points.reduce((a, b) => (b.priceCents < a.priceCents ? b : a));

  return (
    <figure className="space-y-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Prijsontwikkeling over tijd"
      >
        <path d={areaPath} fill="var(--color-primary)" fillOpacity="0.08" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.priceCents)} r="3" fill="var(--color-primary)" />
        ))}
      </svg>
      <figcaption className="text-muted-foreground text-xs">
        Laagste prijs in {businessRules.pricing.lowestPriceWindowDays} dagen:{" "}
        <span className="text-foreground font-medium">{formatPrice(lowest.priceCents)}</span> op{" "}
        {formatDate(lowest.recordedAt)}.
      </figcaption>
    </figure>
  );
}
