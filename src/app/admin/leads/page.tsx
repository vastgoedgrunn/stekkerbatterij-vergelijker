import { listAdminLeads } from "@/features/admin/monetization.queries";
import { updateLeadStatusAction } from "@/features/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

const statusVariant: Record<string, "default" | "warning" | "success" | "muted"> = {
  new: "warning",
  approved: "default",
  sent: "success",
  converted: "success",
  rejected: "muted",
};

export default async function AdminLeadsPage() {
  let leads: Awaited<ReturnType<typeof listAdminLeads>> = [];
  try {
    leads = await listAdminLeads();
  } catch {
    leads = [];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Vaste thuisbatterij-aanvragen — doorsturen pas na goedkeuring.
      </p>

      <div className="border-border mt-8 overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Bron</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Geschatte commissie</TableHead>
              <TableHead>Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  Nog geen leads.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(lead.created_at).toLocaleDateString("nl-NL")}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{lead.customer_name ?? lead.customer_email}</p>
                    <p className="text-muted-foreground text-xs">{lead.postal_code}</p>
                  </TableCell>
                  <TableCell>{lead.source}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[lead.status] ?? "muted"}>{lead.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {lead.estimated_commission_cents != null
                      ? formatPrice(lead.estimated_commission_cents)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {lead.status === "new" && (
                      <form action={updateLeadStatusAction} className="flex gap-2">
                        <input type="hidden" name="leadId" value={lead.id} />
                        <input type="hidden" name="status" value="approved" />
                        <Button type="submit" size="sm">
                          Goedkeuren
                        </Button>
                      </form>
                    )}
                    {lead.status === "approved" && (
                      <form action={updateLeadStatusAction} className="flex gap-2">
                        <input type="hidden" name="leadId" value={lead.id} />
                        <input type="hidden" name="status" value="sent" />
                        <Button type="submit" size="sm" variant="outline">
                          Markeer verzonden
                        </Button>
                      </form>
                    )}
                    {(lead.status === "sent" || lead.status === "approved") && (
                      <form action={updateLeadStatusAction} className="mt-2 flex gap-2">
                        <input type="hidden" name="leadId" value={lead.id} />
                        <input type="hidden" name="status" value="converted" />
                        <Button type="submit" size="sm" variant="secondary">
                          Geconverteerd
                        </Button>
                      </form>
                    )}
                    {lead.status !== "rejected" && lead.status !== "converted" && (
                      <form
                        action={updateLeadStatusAction}
                        className="mt-2 flex items-center gap-2"
                      >
                        <input type="hidden" name="leadId" value={lead.id} />
                        <input type="hidden" name="status" value="rejected" />
                        <Input name="notes" placeholder="Reden afwijzing" className="h-8 text-xs" />
                        <Button type="submit" size="sm" variant="ghost">
                          Afwijzen
                        </Button>
                      </form>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
