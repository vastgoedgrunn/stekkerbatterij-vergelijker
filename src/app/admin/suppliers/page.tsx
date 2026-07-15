import Link from "next/link";
import type { Route } from "next";
import { listAdminSuppliers } from "@/features/admin/queries";
import { upsertSupplierAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminSuppliersPage() {
  let suppliers: Awaited<ReturnType<typeof listAdminSuppliers>> = [];
  let loadError: string | null = null;
  try {
    suppliers = await listAdminSuppliers();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Kon leveranciers niet laden.";
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight">Leveranciers</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Dropship-partners voor eigen verkoop. Zet een contact-e-mail voor order-routing.
      </p>

      <form
        action={upsertSupplierAction}
        className="border-border mt-8 space-y-4 rounded-2xl border p-6"
      >
        <h2 className="font-semibold">Nieuwe leverancier</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="new-name">Naam</Label>
            <Input id="new-name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-email">Contact e-mail</Label>
            <Input id="new-email" name="contactEmail" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-url">Website</Label>
            <Input id="new-url" name="websiteUrl" type="url" />
          </div>
        </div>
        <Button type="submit" size="sm">
          Toevoegen
        </Button>
      </form>

      {loadError ? (
        <p className="text-destructive mt-6 text-sm">{loadError}</p>
      ) : (
        <div className="border-border mt-8 overflow-hidden rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Website</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <Link
                      href={`/admin/suppliers/${supplier.id}` as Route}
                      className="font-medium hover:underline"
                    >
                      {supplier.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {supplier.contact_email ?? "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {supplier.website_url ?? "-"}
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
