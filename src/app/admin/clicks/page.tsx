import Link from "next/link";
import type { Route } from "next";
import { listClickSummary, listRecentOfferClicks } from "@/features/admin/monetization.queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { classifyUserAgent } from "@/lib/observability/user-agent-hint";

export const dynamic = "force-dynamic";

type Range = "7d" | "30d" | "all";

function parseRange(raw: string | undefined): Range {
  if (raw === "30d" || raw === "all" || raw === "7d") return raw;
  return "7d";
}

function rangeStart(range: Range): Date | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : 30;
  return new Date(Date.now() - days * 86400000);
}

function shortReferrer(referrer: string | null): string {
  if (!referrer) return "(direct / onbekend)";
  try {
    const u = new URL(referrer);
    return u.hostname.replace(/^www\./, "") + (u.pathname === "/" ? "" : u.pathname.slice(0, 24));
  } catch {
    return referrer.slice(0, 40);
  }
}

export default async function AdminClicksPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rangeParam } = await searchParams;
  const range = parseRange(rangeParam);
  const since = rangeStart(range);

  let summary: Awaited<ReturnType<typeof listClickSummary>> = [];
  let recent: Awaited<ReturnType<typeof listRecentOfferClicks>> = [];
  try {
    [summary, recent] = await Promise.all([listClickSummary(), listRecentOfferClicks(200)]);
  } catch {
    summary = [];
    recent = [];
  }

  const filtered = since ? recent.filter((click) => new Date(click.created_at) >= since) : recent;

  const ranges: { value: Range; label: string }[] = [
    { value: "7d", label: "7 dagen" },
    { value: "30d", label: "30 dagen" },
    { value: "all", label: "Alles" },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Affiliate-kliks</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Server-side outbound kliks via /api/go, met referrer en UA-hint (bot vs browser).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ranges.map((r) => {
            const active = range === r.value;
            return (
              <Link
                key={r.value}
                href={`/admin/clicks?range=${r.value}` as Route}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </Link>
            );
          })}
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Per offer</h2>
      <div className="border-border mt-4 overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Aanbieder</TableHead>
              <TableHead>Kliks</TableHead>
              <TableHead>Laatste klik</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  Nog geen kliks geregistreerd.
                </TableCell>
              </TableRow>
            ) : (
              summary.map((row) => (
                <TableRow key={row.offer_id}>
                  <TableCell>{row.product_name}</TableCell>
                  <TableCell>{row.merchant_name}</TableCell>
                  <TableCell>
                    <Badge variant="default">{row.click_count}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {row.last_click_at ? new Date(row.last_click_at).toLocaleString("nl-NL") : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Recente kliks ({filtered.length})</h2>
      <div className="border-border mt-4 overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tijd</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Aanbieder</TableHead>
              <TableHead>Referrer</TableHead>
              <TableHead>UA</TableHead>
              <TableHead>Click ref</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  Geen kliks in deze periode.
                </TableCell>
              </TableRow>
            ) : (
              filtered.slice(0, 80).map((click) => {
                const ua = classifyUserAgent(click.user_agent);
                return (
                  <TableRow key={click.id}>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {new Date(click.created_at).toLocaleString("nl-NL")}
                    </TableCell>
                    <TableCell>{click.products?.name ?? "-"}</TableCell>
                    <TableCell>{click.merchants?.name ?? "-"}</TableCell>
                    <TableCell className="max-w-[160px] truncate text-sm">
                      {shortReferrer(click.referrer)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ua.likelyBot ? "warning" : "secondary"}>{ua.label}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {click.click_ref?.slice(0, 8) ?? "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
