import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRevenueSummary } from "@/features/admin/monetization.queries";
import { countPendingChangeRequests } from "@/features/admin/queries";
import { getPlausibleVisitorSummary } from "@/lib/observability/plausible-stats";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminKpiGrid } from "@/features/admin/components/admin-kpi-grid";

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
      label: "Bezoekers 7d",
      value: visitors.last7Days != null ? String(visitors.last7Days) : "—",
      hint: "Unieke bezoekers",
    },
    {
      label: "Kliks 7d",
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
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="Overzicht van verkeer, affiliate-kliks en openstaande ops."
        actions={
          <Link
            href={"/admin/analytics" as Route}
            className={cn(buttonVariants({ size: "md" }), "w-full sm:w-auto")}
          >
            Open analytics
          </Link>
        }
      />

      <AdminKpiGrid items={kpis} />

      <section>
        <h2 className="text-base font-semibold sm:text-lg">Snel naar</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {shortcuts.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-border bg-card hover:border-primary/40 group flex items-start justify-between gap-3 rounded-2xl border p-4 transition-colors sm:p-5"
            >
              <div className="min-w-0">
                <p className="font-semibold">{item.title}</p>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
              <ArrowRight className="text-muted-foreground group-hover:text-primary mt-0.5 size-4 shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
