import { formatNumber, formatPrice } from "@/lib/format";
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

  const cvrPct = summary
    ? formatNumber(summary.assumedClickToSaleRate * 100, { maximumFractionDigits: 0 })
    : null;

  const cards = summary
    ? [
        { label: "Kliks totaal", value: String(summary.totalClicks) },
        { label: "Kliks 7d", value: String(summary.clicksLast7Days) },
        {
          label: "Affiliate 7d (verwacht)",
          value: formatPrice(summary.estimatedAffiliateCents),
          hint: `Kliks × ${cvrPct}% koop × commissie. Geen netwerk-bevestiging.`,
        },
        {
          label: "Affiliate 7d (max bij 100% koop)",
          value: formatPrice(summary.theoreticalMaxAffiliateCents),
          hint: "Alleen ter vergelijking: elke klik als sale (onrealistisch).",
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
        description="Affiliate-omzet is een schatting: niet elke klik is een verkoop. Echte sales staan in Bol/Daisycon."
      />

      {!summary ? (
        <p className="text-muted-foreground text-sm">Kon omzetgegevens niet laden.</p>
      ) : (
        <AdminKpiGrid items={cards} className="xl:grid-cols-4" />
      )}
    </div>
  );
}
