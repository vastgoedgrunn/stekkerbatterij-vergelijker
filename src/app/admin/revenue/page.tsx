import { formatPrice } from "@/lib/format";
import { getRevenueSummary } from "@/features/admin/monetization.queries";
import { Card, CardContent } from "@/components/ui/card";

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
        { label: "Affiliate-kliks (totaal)", value: String(summary.totalClicks) },
        { label: "Kliks (7 dagen)", value: String(summary.clicksLast7Days) },
        {
          label: "Geschatte affiliate-omzet (7d)",
          value: formatPrice(summary.estimatedAffiliateCents),
        },
        { label: "Energie-kliks", value: String(summary.energyClicks) },
        { label: "Leads (totaal / nieuw)", value: `${summary.totalLeads} / ${summary.newLeads}` },
        { label: "Betaalde orders", value: String(summary.paidOrders) },
        { label: "Orderomzet", value: formatPrice(summary.orderRevenueCents) },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Omzet &amp; revenue</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Geschatte affiliate-commissie op basis van geverifieerde tarieven, zonder
        netwerk-bevestiging.
      </p>

      {!summary ? (
        <p className="text-muted-foreground mt-8">Kon omzetgegevens niet laden.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.label}>
              <CardContent className="p-5">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
