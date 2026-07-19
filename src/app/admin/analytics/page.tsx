import Link from "next/link";
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
import { cn } from "@/lib/utils";
import { getPlausibleDashboard, type PlausiblePeriod } from "@/lib/observability/plausible-stats";
import { VisitorsChart } from "@/features/admin/components/visitors-chart";

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
        { label: "Unieke bezoekers", value: String(data.aggregate.visitors) },
        { label: "Pageviews", value: String(data.aggregate.pageviews) },
        { label: "Sessies", value: String(data.aggregate.visits) },
        {
          label: "Bounce rate",
          value:
            data.aggregate.bounceRate != null ? `${Math.round(data.aggregate.bounceRate)}%` : "—",
        },
        {
          label: "Bezoeksduur",
          value: formatDuration(data.aggregate.visitDuration),
        },
        {
          label: "offer_clicked",
          value: data.offerClicks != null ? String(data.offerClicks) : "—",
        },
      ]
    : [];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Verkeer via Plausible. Bekende bots zijn uitgesloten. Bronnen en pagina&apos;s laten
            zien waar echte bezoekers vandaan komen.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => {
            const href = `/admin/analytics?period=${p.value}` as Route;
            const active = period === p.value;
            return (
              <Link
                key={p.value}
                href={href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {p.label}
              </Link>
            );
          })}
        </div>
      </div>

      {!data.configured || (!data.aggregate && data.error) ? (
        <Card className="mt-8">
          <CardContent className="space-y-3 p-6">
            <p className="font-semibold">Analytics nog niet gekoppeld</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {data.error ??
                "Zet een Plausible Stats API-key in Vercel als PLAUSIBLE_API_KEY, plus NEXT_PUBLIC_PLAUSIBLE_DOMAIN."}
            </p>
            <ol className="text-muted-foreground list-decimal space-y-1 pl-5 text-sm">
              <li>Plausible → account → Settings → API keys → New API Key (Stats API)</li>
              <li>
                Vercel → Environment Variables →{" "}
                <code className="text-foreground">PLAUSIBLE_API_KEY</code> (Production, Preview,
                Development)
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
            <p className="border-border bg-card text-muted-foreground mt-6 rounded-xl border px-4 py-3 text-sm">
              Deels geladen. Waarschuwing: {data.error}
            </p>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <Card key={card.label}>
                <CardContent className="p-5">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-tight">{card.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <CardContent className="p-5">
              <p className="mb-4 text-sm font-semibold">Bezoekers per dag</p>
              <VisitorsChart points={data.timeseries} />
            </CardContent>
          </Card>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
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
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="border-border mt-3 overflow-hidden rounded-2xl border">
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
    </div>
  );
}
