import { listClickSummary, listRecentOfferClicks } from "@/features/admin/monetization.queries";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminClicksPage() {
  let summary: Awaited<ReturnType<typeof listClickSummary>> = [];
  let recent: Awaited<ReturnType<typeof listRecentOfferClicks>> = [];
  try {
    [summary, recent] = await Promise.all([listClickSummary(), listRecentOfferClicks(50)]);
  } catch {
    summary = [];
    recent = [];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Affiliate-kliks</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Server-side geregistreerde outbound kliks via /api/go.
      </p>

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
                    {row.last_click_at
                      ? new Date(row.last_click_at).toLocaleString("nl-NL")
                      : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Recente kliks</h2>
      <div className="border-border mt-4 overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tijd</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Aanbieder</TableHead>
              <TableHead>Click ref</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((click) => (
              <TableRow key={click.id}>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(click.created_at).toLocaleString("nl-NL")}
                </TableCell>
                <TableCell>{click.products?.name ?? "—"}</TableCell>
                <TableCell>{click.merchants?.name ?? "—"}</TableCell>
                <TableCell className="font-mono text-xs">{click.click_ref?.slice(0, 8) ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
