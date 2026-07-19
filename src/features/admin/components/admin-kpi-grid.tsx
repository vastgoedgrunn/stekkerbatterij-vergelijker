import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AdminKpi = {
  label: string;
  value: string;
  hint?: string;
};

export function AdminKpiGrid({ items, className }: { items: AdminKpi[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5", className)}>
      {items.map((kpi) => (
        <Card key={kpi.label} className="min-w-0 shadow-none">
          <CardContent className="p-3.5 sm:p-5">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase sm:text-xs">
              {kpi.label}
            </p>
            <p className="mt-1.5 truncate text-xl font-bold tracking-tight sm:mt-2 sm:text-2xl">
              {kpi.value}
            </p>
            {kpi.hint ? (
              <p className="text-muted-foreground mt-1 line-clamp-2 text-[11px] leading-snug sm:text-xs">
                {kpi.hint}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
