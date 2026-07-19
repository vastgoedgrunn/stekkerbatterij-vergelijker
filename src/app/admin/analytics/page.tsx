import type { Route } from "next";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPlausibleDashboard, type PlausiblePeriod } from "@/lib/observability/plausible-stats";
import { VisitorsChart } from "@/features/admin/components/visitors-chart";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminSegmentedControl } from "@/features/admin/components/admin-segmented-control";
import { AdminKpiGrid } from "@/features/admin/components/admin-kpi-grid";
import { AdminTableFrame } from "@/features/admin/components/admin-table-frame";

export const dynamic = "force-dynamic";

const PERIODS: { value: PlausiblePeriod; label: string }[] = [
  { value: "day", label: "Vandaag" },
  { value: "7d", label: "7 dagen" },
  { value: "30d", label: "30 dagen" },
  { value: "91d", label: "90 dagen" },
];

function parsePeriod(raw: string | undefined): PlausiblePeriod {
  if (raw === "day" || raw === "7d" || raw === "30d" || raw === "91d") return raw;
  return "7d";
}

function formatDuration(seconds: number | null): string {
  if (seconds == null || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: periodParam } = await searchParams;
  const period = parsePeriod(periodParam);
  const data = await getPlausibleDashboard(period);

  const cards = data.aggregate
    ? [
        { label: "Bezoekers", value: String(data.aggregate.visitors) },
        { label: "Pageviews", value: String(data.aggregate.pageviews) },
        { label: "Sessies", value: String(data.aggregate.visits) },
        {
          label: "Bounce",
          value:
            data.aggregate.bounceRate != null ? `${Math.round(data.aggregate.bounceRate)}%` : "—",
        },
        {
          label: "Duur",
          value: formatDuration(data.aggregate.visitDuration),
        },
        {
          label: "Offer kliks",
          value: data.offerClicks != null ? String(data.offerClicks) : "—",
        },
      ]
    : [];

  return (
    <div className="space-y-6 sm:space-y-8">
      <AdminPageHeader
        title="Analytics"
        description="Verkeer via Plausible. Bekende bots zijn uitgesloten. Bronnen en pagina's laten zien waar echte bezoekers vandaan komen."
        actions={
          <AdminSegmentedControl
            active={period}
            items={PERIODS.map((p) => ({
              value: p.value,
              label: p.label,
              href: `/admin/analytics?period=${p.value}` as Route,
            }))}
          />
        }
      />

      {!data.configured || (!data.aggregate && data.error) ? (
        <Card className="shadow-none">
          <CardContent className="space-y-3 p-5 sm:p-6">
            <p className="font-semibold">Analytics nog niet gekoppeld</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {data.error ??
                "Zet een Plausible Stats API-key in Vercel als PLAUSIBLE_API_KEY, plus NEXT_PUBLIC_PLAUSIBLE_DOMAIN."}
            </p>
            <ol className="text-muted-foreground list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
              <li>Plausible → account → Settings → API keys → New API Key (Stats API)</li>
              <li>
                Vercel → Environment Variables →{" "}
                <code className="text-foreground">PLAUSIBLE_API_KEY</code>
              </li>
              <li>Redeploy, daarna deze pagina vernieuwen</li>
            </ol>
            <p className="text-muted-foreground text-xs">
              Site-id verwacht: {data.siteId ?? "NEXT_PUBLIC_PLAUSIBLE_DOMAIN nog leeg"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {data.error ? (
            <p className="border-border bg-card text-muted-foreground rounded-xl border px-4 py-3 text-sm leading-relaxed">
              Deels geladen. Waarschuwing: {data.error}
            </p>
          ) : null}

          <AdminKpiGrid items={cards} className="xl:grid-cols-6" />

          <Card className="shadow-none">
            <CardContent className="p-4 sm:p-5">
              <p className="mb-4 text-sm font-semibold">Bezoekers per dag</p>
              <VisitorsChart points={data.timeseries} />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <BreakdownTable title="Top bronnen" rows={data.sources} showPageviews />
            <BreakdownTable title="Top pagina's" rows={data.pages} showPageviews />
            <BreakdownTable title="Devices" rows={data.devices} />
            <BreakdownTable title="Landen" rows={data.countries} />
          </div>
        </>
      )}
    </div>
  );
}

function BreakdownTable({
  title,
  rows,
  showPageviews = false,
}: {
  title: string;
  rows: { label: string; visitors: number; pageviews?: number }[];
  showPageviews?: boolean;
}) {
  return (
    <AdminTableFrame title={title}>
      {/* Mobiel: stacked rows */}
      <ul className="divide-border divide-y sm:hidden">
        {rows.length === 0 ? (
          <li className="text-muted-foreground px-4 py-4 text-sm">Geen data in deze periode.</li>
        ) : (
          rows.map((row) => (
            <li
              key={`${title}-${row.label}`}
              className="flex items-start justify-between gap-3 px-4 py-3"
            >
              <span className="min-w-0 truncate text-sm font-medium">{row.label}</span>
              <span className="text-muted-foreground shrink-0 text-right text-sm tabular-nums">
                {row.visitors}
                {showPageviews ? (
                  <span className="block text-xs">pv {row.pageviews ?? "—"}</span>
                ) : null}
              </span>
            </li>
          ))
        )}
      </ul>

      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead className="text-right">Bezoekers</TableHead>
              {showPageviews ? <TableHead className="text-right">Pageviews</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showPageviews ? 3 : 2} className="text-muted-foreground">
                  Geen data in deze periode.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={`${title}-${row.label}`}>
                  <TableCell className="max-w-[220px] truncate font-medium">{row.label}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.visitors}</TableCell>
                  {showPageviews ? (
                    <TableCell className="text-right tabular-nums">
                      {row.pageviews ?? "—"}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminTableFrame>
  );
}
