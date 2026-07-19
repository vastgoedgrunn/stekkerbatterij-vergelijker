import Link from "next/link";
import type { Route } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRevenueSummary } from "@/features/admin/monetization.queries";
import { countPendingChangeRequests } from "@/features/admin/queries";
import { getPlausibleVisitorSummary } from "@/lib/observability/plausible-stats";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let revenue: Awaited<ReturnType<typeof getRevenueSummary>> | null = null;
  let pendingChanges = 0;
  let visitors: Awaited<ReturnType<typeof getPlausibleVisitorSummary>> = {
    today: null,
    last7Days: null,
    configured: false,
  };

  try {
    [revenue, pendingChanges, visitors] = await Promise.all([
      getRevenueSummary(),
      countPendingChangeRequests(),
      getPlausibleVisitorSummary(),
    ]);
  } catch {
    try {
      pendingChanges = await countPendingChangeRequests();
    } catch {
      pendingChanges = 0;
    }
  }

  const kpis = [
    {
      label: "Bezoekers vandaag",
      value: visitors.today != null ? String(visitors.today) : visitors.configured ? "0" : "—",
      hint: visitors.configured ? "Plausible, bots uitgesloten" : "API-key nog niet gezet",
    },
    {
      label: "Bezoekers 7 dagen",
      value: visitors.last7Days != null ? String(visitors.last7Days) : "—",
      hint: "Unieke bezoekers",
    },
    {
      label: "Affiliate-kliks 7d",
      value: revenue ? String(revenue.clicksLast7Days) : "—",
      hint: "Via /api/go",
    },
    {
      label: "Nieuwe leads",
      value: revenue ? String(revenue.newLeads) : "—",
      hint: "Status nieuw",
    },
    {
      label: "Reviewwachtrij",
      value: String(pendingChanges),
      hint: "Open change requests",
    },
  ];

  const shortcuts: { href: Route; title: string; description: string }[] = [
    {
      href: "/admin/analytics" as Route,
      title: "Analytics",
      description: "Bezoekers, bronnen, pagina's en devices",
    },
    {
      href: "/admin/clicks" as Route,
      title: "Affiliate-kliks",
      description: "Outbound kliks met referrer en UA-hint",
    },
    {
      href: "/admin/catalog" as Route,
      title: "Catalogus-health",
      description: "Discovery, gaten en outbound-status",
    },
    {
      href: "/admin/changes" as Route,
      title: "Reviewwachtrij",
      description: "Agent-wijzigingen goedkeuren",
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Overzicht van verkeer, affiliate-kliks en openstaande ops.
          </p>
        </div>
        <Link href={"/admin/analytics" as Route} className={cn(buttonVariants({ size: "sm" }))}>
          Open analytics
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {kpi.label}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight">{kpi.value}</p>
              <p className="text-muted-foreground mt-1 text-xs">{kpi.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Snel naar</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {shortcuts.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border-border bg-card hover:border-primary/40 rounded-2xl border p-5 transition-colors"
          >
            <p className="font-semibold">{item.title}</p>
            <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
