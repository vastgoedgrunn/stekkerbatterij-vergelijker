import Link from "next/link";
import type { Route } from "next";
import { listAdminOrders } from "@/features/admin/queries";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/lib/db/database.types";

export const dynamic = "force-dynamic";

const statusVariant: Record<
  OrderStatus,
  "default" | "success" | "warning" | "muted"
> = {
  pending: "warning",
  paid: "success",
  shipped: "success",
  failed: "muted",
  cancelled: "muted",
  refunded: "muted",
};

export default async function AdminOrdersPage() {
  let orders: Awaited<ReturnType<typeof listAdminOrders>> = [];
  let loadError: string | null = null;
  try {
    orders = await listAdminOrders();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Kon orders niet laden.";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Overzicht van webshop-bestellingen. Fulfilment-acties volgen in de orderdetailpagina.
      </p>

      {loadError ? (
        <p className="text-destructive mt-6 text-sm">{loadError}</p>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground mt-6 text-sm">Nog geen orders.</p>
      ) : (
        <div className="border-border mt-6 overflow-hidden rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Klant</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="text-right">Totaal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/admin/orders/${order.id}` as Route}
                      className="font-medium hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{order.email}</TableCell>
                  <TableCell>{formatDate(order.placed_at)}</TableCell>
                  <TableCell className="text-right">{formatPrice(order.total_cents)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
