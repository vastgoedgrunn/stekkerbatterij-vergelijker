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
import { classifyUserAgent } from "@/lib/observability/user-agent-hint";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminSegmentedControl } from "@/features/admin/components/admin-segmented-control";
import { AdminTableFrame } from "@/features/admin/components/admin-table-frame";

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
  const shown = filtered.slice(0, 80);

  const ranges: { value: Range; label: string }[] = [
    { value: "7d", label: "7 dagen" },
    { value: "30d", label: "30 dagen" },
    { value: "all", label: "Alles" },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Affiliate-kliks"
        description="Server-side outbound kliks via /api/go, met referrer en UA-hint (bot vs browser)."
        actions={
          <AdminSegmentedControl
            active={range}
            items={ranges.map((r) => ({
              value: r.value,
              label: r.label,
              href: `/admin/clicks?range=${r.value}` as Route,
            }))}
          />
        }
      />

      <AdminTableFrame title="Per offer">
        <ul className="divide-border divide-y sm:hidden">
          {summary.length === 0 ? (
            <li className="text-muted-foreground px-4 py-4 text-sm">
              Nog geen kliks geregistreerd.
            </li>
          ) : (
            summary.map((row) => (
              <li key={row.offer_id} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.product_name}</p>
                  <p className="text-muted-foreground truncate text-xs">{row.merchant_name}</p>
                </div>
                <div className="shrink-0 text-right">
                  <Badge variant="default">{row.click_count}</Badge>
                  <p className="text-muted-foreground mt-1 text-[11px]">
                    {row.last_click_at
                      ? new Date(row.last_click_at).toLocaleDateString("nl-NL")
                      : "-"}
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
        <div className="hidden sm:block">
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
                      {row.last_click_at
                        ? new Date(row.last_click_at).toLocaleString("nl-NL")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </AdminTableFrame>

      <AdminTableFrame title={`Recente kliks (${filtered.length})`}>
        <ul className="divide-border divide-y sm:hidden">
          {shown.length === 0 ? (
            <li className="text-muted-foreground px-4 py-4 text-sm">Geen kliks in deze periode.</li>
          ) : (
            shown.map((click) => {
              const ua = classifyUserAgent(click.user_agent);
              return (
                <li key={click.id} className="space-y-2 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{click.products?.name ?? "-"}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {click.merchants?.name ?? "-"}
                      </p>
                    </div>
                    <Badge variant={ua.likelyBot ? "warning" : "secondary"}>{ua.label}</Badge>
                  </div>
                  <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                    <span>{new Date(click.created_at).toLocaleString("nl-NL")}</span>
                    <span className="truncate">{shortReferrer(click.referrer)}</span>
                    <span className="font-mono">{click.click_ref?.slice(0, 8) ?? "-"}</span>
                  </div>
                </li>
              );
            })
          )}
        </ul>
        <div className="hidden sm:block">
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
              {shown.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    Geen kliks in deze periode.
                  </TableCell>
                </TableRow>
              ) : (
                shown.map((click) => {
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
      </AdminTableFrame>
    </div>
  );
}
