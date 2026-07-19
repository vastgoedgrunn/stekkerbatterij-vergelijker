import type { PlausibleTimeseriesPoint } from "@/lib/observability/plausible-stats";

export function VisitorsChart({ points }: { points: PlausibleTimeseriesPoint[] }) {
  if (points.length === 0) {
    return <p className="text-muted-foreground py-10 text-center text-sm">Geen timeseries-data.</p>;
  }

  const max = Math.max(...points.map((p) => p.visitors), 1);

  return (
    <div className="space-y-3">
      <div className="flex h-40 items-end gap-1 sm:gap-1.5">
        {points.map((point) => {
          const height = Math.max(4, Math.round((point.visitors / max) * 100));
          return (
            <div
              key={point.date}
              className="group relative flex min-w-0 flex-1 flex-col items-center justify-end"
            >
              <div
                className="bg-primary/80 hover:bg-primary w-full max-w-8 rounded-t-sm transition-colors"
                style={{ height: `${height}%` }}
                title={`${point.date}: ${point.visitors} bezoekers`}
              />
            </div>
          );
        })}
      </div>
      <div className="text-muted-foreground flex justify-between text-[10px] sm:text-xs">
        <span>{points[0]?.date}</span>
        <span>{points[points.length - 1]?.date}</span>
      </div>
    </div>
  );
}
