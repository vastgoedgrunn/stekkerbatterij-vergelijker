import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { getAdminOrder } from "@/features/admin/queries";
import { updateOrderNotesAction } from "@/features/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  try {
    order = await getAdminOrder(id);
  } catch {
    notFound();
  }
  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <Link href={"/admin/orders" as Route} className="text-muted-foreground hover:text-foreground text-sm">
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
          <dd>{order.paid_at ? formatDate(order.paid_at) : "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Factuurnummer</dt>
          <dd>{order.invoice_number ?? "—"}</dd>
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
