import Link from "next/link";
import type { Route } from "next";
import { listAdminProducts } from "@/features/admin/queries";
import { Badge } from "@/components/ui/badge";
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

export default async function AdminProductsPage() {
  let products: Awaited<ReturnType<typeof listAdminProducts>> = [];
  let loadError: string | null = null;
  try {
    products = await listAdminProducts();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Kon producten niet laden.";
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Producten"
        description="Beheer SKU, inkoopprijs en leverancierkoppeling voor eigen verkoop."
      />

      {loadError ? (
        <p className="text-destructive text-sm">{loadError}</p>
      ) : (
        <AdminTableFrame>
          <ul className="divide-border divide-y sm:hidden">
            {products.length === 0 ? (
              <li className="text-muted-foreground px-4 py-4 text-sm">Geen producten.</li>
            ) : (
              products.map((product) => (
                <li key={product.id} className="px-4 py-3">
                  <Link
                    href={`/admin/products/${product.id}` as Route}
                    className="block font-medium hover:underline"
                  >
                    {product.name}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Badge variant={product.status === "published" ? "success" : "muted"}>
                      {product.status}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {product.brands?.name ?? "-"}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {product.cost_cents != null ? formatPrice(product.cost_cents) : "geen inkoop"}
                    </span>
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
                    <TableCell className="text-muted-foreground">{product.sku ?? "-"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.suppliers?.name ?? "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {product.cost_cents != null ? formatPrice(product.cost_cents) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </AdminTableFrame>
      )}
    </div>
  );
}
