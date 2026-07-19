import type { PlausibleTimeseriesPoint } from "@/lib/observability/plausible-stats";

export function VisitorsChart({ points }: { points: PlausibleTimeseriesPoint[] }) {
  if (points.length === 0) {
    return <p className="text-muted-foreground py-10 text-center text-sm">Geen timeseries-data.</p>;
  }

  const max = Math.max(...points.map((p) => p.visitors), 1);
  const compact = points.length > 14;

  return (
    <div className="space-y-3">
      <div className="flex h-36 items-end gap-0.5 sm:h-44 sm:gap-1.5">
        {points.map((point) => {
          const height = Math.max(6, Math.round((point.visitors / max) * 100));
          return (
            <div
              key={point.date}
              className="group relative flex min-w-0 flex-1 flex-col items-center justify-end"
            >
              <span className="bg-foreground text-background pointer-events-none absolute -top-8 z-10 hidden rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap group-hover:block sm:text-xs">
                {point.date}: {point.visitors}
              </span>
              <div
                className="bg-primary/75 hover:bg-primary w-full max-w-10 rounded-t-sm transition-colors"
                style={{ height: `${height}%` }}
                title={`${point.date}: ${point.visitors} bezoekers`}
              />
            </div>
          );
        })}
      </div>
      <div className="text-muted-foreground flex justify-between gap-2 text-[10px] sm:text-xs">
        <span className="truncate">{compact ? points[0]?.date.slice(5) : points[0]?.date}</span>
        <span className="truncate">
          {compact ? points[points.length - 1]?.date.slice(5) : points[points.length - 1]?.date}
        </span>
      </div>
    </div>
  );
}
