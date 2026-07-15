import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { getAdminSupplier } from "@/features/admin/queries";
import { upsertSupplierAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default async function AdminSupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let supplier: Awaited<ReturnType<typeof getAdminSupplier>> = null;
  try {
    supplier = await getAdminSupplier(id);
  } catch {
    notFound();
  }
  if (!supplier) notFound();

  return (
    <div className="max-w-xl">
      <Link
        href={"/admin/suppliers" as Route}
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Alle leveranciers
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{supplier.name}</h1>

      <form action={upsertSupplierAction} className="border-border mt-8 space-y-4 border-t pt-6">
        <input type="hidden" name="id" value={supplier.id} />
        <div className="space-y-2">
          <Label htmlFor="name">Naam</Label>
          <Input id="name" name="name" defaultValue={supplier.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact e-mail</Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={supplier.contact_email ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Website</Label>
          <Input
            id="websiteUrl"
            name="websiteUrl"
            type="url"
            defaultValue={supplier.website_url ?? ""}
          />
        </div>
        <Button type="submit">Opslaan</Button>
      </form>
    </div>
  );
}
