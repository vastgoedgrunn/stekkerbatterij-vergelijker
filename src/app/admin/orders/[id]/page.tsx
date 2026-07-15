import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { getAdminOrder } from "@/features/admin/queries";
import {
  approveApprovalAction,
  markShippedAction,
  updateOrderNotesAction,
} from "@/features/admin/actions";
import { approveRefundAction, requestRefundAction } from "@/features/support/actions";
import {
  approvalKindLabel,
  listOrderApprovalActions,
  listOrderShipments,
} from "@/features/admin/fulfillment.server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let order: Awaited<ReturnType<typeof getAdminOrder>> = null;
  let approvals: Awaited<ReturnType<typeof listOrderApprovalActions>> = [];
  let shipments: Awaited<ReturnType<typeof listOrderShipments>> = [];
  try {
    [order, approvals, shipments] = await Promise.all([
      getAdminOrder(id),
      listOrderApprovalActions(id),
      listOrderShipments(id),
    ]);
  } catch {
    notFound();
  }
  if (!order) notFound();

  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const pendingNonRefund = pendingApprovals.filter((a) => a.kind !== "refund");
  const pendingRefunds = pendingApprovals.filter((a) => a.kind === "refund");

  return (
    <div className="max-w-3xl">
      <Link
        href={"/admin/orders" as Route}
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Alle orders
      </Link>
      <div className="mt-4 flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Order #{order.order_number}</h1>
        <Badge>{order.status}</Badge>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">{order.email}</p>

      <dl className="border-border mt-6 grid gap-2 border-t pt-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Besteld</dt>
          <dd>{formatDate(order.placed_at)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Betaald</dt>
          <dd>{order.paid_at ? formatDate(order.paid_at) : "-"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Factuurnummer</dt>
          <dd>{order.invoice_number ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Totaal</dt>
          <dd className="font-medium">{formatPrice(order.total_cents)}</dd>
        </div>
      </dl>

      <ul className="border-border mt-6 space-y-2 border-t pt-6 text-sm">
        {order.order_lines.map((line) => (
          <li key={line.id} className="flex justify-between gap-3">
            <span>
              {line.quantity}× {line.name}
            </span>
            <span>{formatPrice(line.line_total_cents)}</span>
          </li>
        ))}
      </ul>

      {pendingNonRefund.length > 0 && (
        <section className="border-border mt-8 space-y-4 border-t pt-6">
          <h2 className="font-semibold">Goedkeuring vereist</h2>
          {pendingNonRefund.map((action) => (
            <article key={action.id} className="border-border rounded-xl border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="warning">{approvalKindLabel(action.kind)}</Badge>
                <span className="text-sm font-medium">{action.summary}</span>
              </div>
              {action.recipient_email && (
                <p className="text-muted-foreground mt-2 text-sm">Naar: {action.recipient_email}</p>
              )}
              {action.email_subject && (
                <p className="text-muted-foreground mt-1 text-sm">
                  Onderwerp: {action.email_subject}
                </p>
              )}
              <form action={approveApprovalAction} className="mt-4">
                <input type="hidden" name="actionId" value={action.id} />
                <input type="hidden" name="orderId" value={order.id} />
                <Button type="submit" size="sm">
                  Goedkeuren &amp; versturen
                </Button>
              </form>
            </article>
          ))}
        </section>
      )}

      {pendingRefunds.length > 0 && (
        <section className="border-border mt-8 space-y-4 border-t pt-6">
          <h2 className="font-semibold">Terugbetaling: goedkeuring vereist</h2>
          {pendingRefunds.map((action) => (
            <article key={action.id} className="border-border rounded-xl border p-4">
              <p className="text-sm font-medium">{action.summary}</p>
              <form action={approveRefundAction} className="mt-4">
                <input type="hidden" name="actionId" value={action.id} />
                <input type="hidden" name="orderId" value={order.id} />
                <Button type="submit" size="sm" variant="outline">
                  Terugbetaling goedkeuren (Mollie)
                </Button>
              </form>
            </article>
          ))}
        </section>
      )}

      {(order.status === "paid" || order.status === "shipped") && pendingRefunds.length === 0 && (
        <form action={requestRefundAction} className="border-border mt-8 space-y-3 border-t pt-6">
          <input type="hidden" name="orderId" value={order.id} />
          <h2 className="font-semibold">Terugbetaling aanvragen</h2>
          <p className="text-muted-foreground text-sm">
            Maakt een goedkeuringsverzoek aan, geen automatische refund.
          </p>
          <Input name="reason" placeholder="Reden (optioneel)" />
          <Button type="submit" size="sm" variant="outline">
            Refund ter goedkeuring indienen
          </Button>
        </form>
      )}

      {shipments.length > 0 && (
        <section className="border-border mt-8 space-y-4 border-t pt-6">
          <h2 className="font-semibold">Verzendingen</h2>
          {shipments.map((shipment) => (
            <article key={shipment.id} className="border-border rounded-xl border p-4">
              <div className="flex items-center gap-2">
                <Badge variant="muted">{shipment.status}</Badge>
                {shipment.tracking_code && (
                  <span className="text-sm">Track: {shipment.tracking_code}</span>
                )}
              </div>
              {shipment.status !== "shipped" && shipment.status !== "delivered" && (
                <form action={markShippedAction} className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input type="hidden" name="shipmentId" value={shipment.id} />
                  <input type="hidden" name="orderId" value={order.id} />
                  <div className="space-y-1">
                    <Label htmlFor={`carrier-${shipment.id}`}>Vervoerder</Label>
                    <Input
                      id={`carrier-${shipment.id}`}
                      name="carrier"
                      placeholder="PostNL"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`track-${shipment.id}`}>Track &amp; trace-code</Label>
                    <Input id={`track-${shipment.id}`} name="trackingCode" required />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor={`url-${shipment.id}`}>Tracking-URL (optioneel)</Label>
                    <Input id={`url-${shipment.id}`} name="trackingUrl" type="url" />
                  </div>
                  <Button type="submit" size="sm" className="sm:col-span-2">
                    Markeer als verzonden + mail klant
                  </Button>
                </form>
              )}
            </article>
          ))}
        </section>
      )}

      {approvals.filter((a) => a.status !== "pending").length > 0 && (
        <section className="border-border mt-8 space-y-2 border-t pt-6">
          <h2 className="font-semibold">Actiehistorie</h2>
          {approvals
            .filter((a) => a.status !== "pending")
            .map((action) => (
              <div key={action.id} className="text-muted-foreground text-sm">
                <Badge variant="muted">{action.status}</Badge> {action.summary}
              </div>
            ))}
        </section>
      )}

      <form action={updateOrderNotesAction} className="border-border mt-8 space-y-3 border-t pt-6">
        <input type="hidden" name="orderId" value={order.id} />
        <label className="block text-sm font-medium" htmlFor="notes">
          Interne notities
        </label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={order.notes ?? ""} />
        <Button type="submit" size="sm">
          Notities opslaan
        </Button>
      </form>
    </div>
  );
}
