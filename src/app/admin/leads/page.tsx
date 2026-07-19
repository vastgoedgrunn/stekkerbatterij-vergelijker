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
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminTableFrame } from "@/features/admin/components/admin-table-frame";

export const dynamic = "force-dynamic";

const statusVariant: Record<string, "default" | "warning" | "success" | "muted"> = {
  new: "warning",
  approved: "default",
  sent: "success",
  converted: "success",
  rejected: "muted",
};

function LeadActions({ lead }: { lead: Awaited<ReturnType<typeof listAdminLeads>>[number] }) {
  return (
    <div className="flex flex-col gap-2">
      {lead.status === "new" && (
        <form action={updateLeadStatusAction}>
          <input type="hidden" name="leadId" value={lead.id} />
          <input type="hidden" name="status" value="approved" />
          <Button type="submit" size="sm" className="w-full sm:w-auto">
            Goedkeuren
          </Button>
        </form>
      )}
      {lead.status === "approved" && (
        <form action={updateLeadStatusAction}>
          <input type="hidden" name="leadId" value={lead.id} />
          <input type="hidden" name="status" value="sent" />
          <Button type="submit" size="sm" variant="outline" className="w-full sm:w-auto">
            Markeer verzonden
          </Button>
        </form>
      )}
      {(lead.status === "sent" || lead.status === "approved") && (
        <form action={updateLeadStatusAction}>
          <input type="hidden" name="leadId" value={lead.id} />
          <input type="hidden" name="status" value="converted" />
          <Button type="submit" size="sm" variant="secondary" className="w-full sm:w-auto">
            Geconverteerd
          </Button>
        </form>
      )}
      {lead.status !== "rejected" && lead.status !== "converted" && (
        <form
          action={updateLeadStatusAction}
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <input type="hidden" name="leadId" value={lead.id} />
          <input type="hidden" name="status" value="rejected" />
          <Input name="notes" placeholder="Reden afwijzing" className="h-9 text-xs" />
          <Button type="submit" size="sm" variant="ghost" className="w-full sm:w-auto">
            Afwijzen
          </Button>
        </form>
      )}
    </div>
  );
}

export default async function AdminLeadsPage() {
  let leads: Awaited<ReturnType<typeof listAdminLeads>> = [];
  try {
    leads = await listAdminLeads();
  } catch {
    leads = [];
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Leads"
        description="Vaste thuisbatterij-aanvragen, doorsturen pas na goedkeuring."
      />

      <AdminTableFrame>
        <ul className="divide-border divide-y sm:hidden">
          {leads.length === 0 ? (
            <li className="text-muted-foreground px-4 py-4 text-sm">Nog geen leads.</li>
          ) : (
            leads.map((lead) => (
              <li key={lead.id} className="space-y-3 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {lead.customer_name ?? lead.customer_email}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(lead.created_at).toLocaleDateString("nl-NL")} ·{" "}
                      {lead.postal_code ?? "geen postcode"}
                    </p>
                  </div>
                  <Badge variant={statusVariant[lead.status] ?? "muted"}>{lead.status}</Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  {lead.product_name ?? "-"} · {lead.source}
                  {lead.estimated_commission_cents != null
                    ? ` · ${formatPrice(lead.estimated_commission_cents)}`
                    : ""}
                </p>
                <LeadActions lead={lead} />
              </li>
            ))
          )}
        </ul>

        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Bron</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Geschatte commissie</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">
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
                    <TableCell className="text-sm">{lead.product_name ?? "-"}</TableCell>
                    <TableCell>{lead.source}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[lead.status] ?? "muted"}>{lead.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {lead.estimated_commission_cents != null
                        ? formatPrice(lead.estimated_commission_cents)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <LeadActions lead={lead} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </AdminTableFrame>
    </div>
  );
}
