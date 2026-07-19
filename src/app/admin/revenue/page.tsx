import { formatPrice } from "@/lib/format";
import { getRevenueSummary } from "@/features/admin/monetization.queries";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminKpiGrid } from "@/features/admin/components/admin-kpi-grid";

export const dynamic = "force-dynamic";

export default async function AdminRevenuePage() {
  let summary: Awaited<ReturnType<typeof getRevenueSummary>> | null = null;
  try {
    summary = await getRevenueSummary();
  } catch {
    summary = null;
  }

  const cards = summary
    ? [
        { label: "Kliks totaal", value: String(summary.totalClicks) },
        { label: "Kliks 7d", value: String(summary.clicksLast7Days) },
        {
          label: "Affiliate 7d",
          value: formatPrice(summary.estimatedAffiliateCents),
          hint: "Geschat, niet netwerk-bevestigd",
        },
        { label: "Energie-kliks", value: String(summary.energyClicks) },
        {
          label: "Leads",
          value: `${summary.totalLeads} / ${summary.newLeads}`,
          hint: "Totaal / nieuw",
        },
        { label: "Betaalde orders", value: String(summary.paidOrders) },
        { label: "Orderomzet", value: formatPrice(summary.orderRevenueCents) },
      ]
    : [];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Omzet & revenue"
        description="Geschatte affiliate-commissie op basis van geverifieerde tarieven, zonder netwerk-bevestiging."
      />

      {!summary ? (
        <p className="text-muted-foreground text-sm">Kon omzetgegevens niet laden.</p>
      ) : (
        <AdminKpiGrid items={cards} className="xl:grid-cols-4" />
      )}
    </div>
  );
}
