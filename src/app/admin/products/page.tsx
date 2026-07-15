import Link from "next/link";
import type { Route } from "next";
import { listAdminProducts } from "@/features/admin/queries";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  let products: Awaited<ReturnType<typeof listAdminProducts>> = [];
  let loadError: string | null = null;
  try {
    products = await listAdminProducts();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Kon producten niet laden.";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Producten</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Beheer SKU, inkoopprijs en leverancierkoppeling voor eigen verkoop.
      </p>

      {loadError ? (
        <p className="text-destructive mt-6 text-sm">{loadError}</p>
      ) : (
        <div className="border-border mt-6 overflow-hidden rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Leverancier</TableHead>
                <TableHead className="text-right">Inkoop</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Link
                      href={`/admin/products/${product.id}` as Route}
                      className="block font-medium hover:underline"
                    >
                      {product.name}
                    </Link>
                    <span className="text-muted-foreground text-xs">{product.brands?.name}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === "published" ? "success" : "muted"}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.sku ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.suppliers?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.cost_cents != null ? formatPrice(product.cost_cents) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
