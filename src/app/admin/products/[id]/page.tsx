import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import {
  getAdminProduct,
  listAdminSuppliers,
  listProductOffers,
} from "@/features/admin/queries";
import { updateProductCommerceAction } from "@/features/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product: Awaited<ReturnType<typeof getAdminProduct>> = null;
  let suppliers: Awaited<ReturnType<typeof listAdminSuppliers>> = [];
  let offers: Awaited<ReturnType<typeof listProductOffers>> = [];
  try {
    [product, suppliers, offers] = await Promise.all([
      getAdminProduct(id),
      listAdminSuppliers(),
      listProductOffers(id),
    ]);
  } catch {
    notFound();
  }
  if (!product) notFound();

  return (
    <div className="max-w-3xl">
      <Link href={"/admin/products" as Route} className="text-muted-foreground hover:text-foreground text-sm">
        ← Alle producten
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{product.name}</h1>
      <p className="text-muted-foreground text-sm">{product.brands?.name}</p>

      <form action={updateProductCommerceAction} className="border-border mt-8 space-y-4 border-t pt-6">
        <input type="hidden" name="productId" value={product.id} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" name="sku" defaultValue={product.sku ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ean">EAN</Label>
            <Input id="ean" name="ean" defaultValue={product.ean ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="costCents">Inkoopprijs (centen)</Label>
            <Input
              id="costCents"
              name="costCents"
              type="number"
              min={0}
              defaultValue={product.cost_cents ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="handlingDays">Verwerkingstijd (dagen)</Label>
            <Input
              id="handlingDays"
              name="handlingDays"
              type="number"
              min={0}
              defaultValue={product.handling_days}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplierId">Leverancier</Label>
          <Select id="supplierId" name="supplierId" defaultValue={product.supplier_id ?? ""}>
            <option value="">Geen (alleen affiliate)</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={product.status}>
            <option value="draft">Concept</option>
            <option value="published">Gepubliceerd</option>
            <option value="archived">Gearchiveerd</option>
          </Select>
        </div>

        <Button type="submit">Opslaan</Button>
      </form>

      {offers.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold">Aanbiedingen</h2>
          <div className="border-border mt-4 overflow-hidden rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prijs</TableHead>
                  <TableHead>Voorraad</TableHead>
                  <TableHead>Levertijd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>{formatPrice(offer.price_cents)}</TableCell>
                    <TableCell>
                      <Badge variant="muted">{offer.stock_status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {offer.delivery_days != null ? `${offer.delivery_days} dagen` : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
