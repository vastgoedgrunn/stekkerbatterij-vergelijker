import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { getAdminProduct, listAdminSuppliers, listProductOffers } from "@/features/admin/queries";
import {
  updateProductCommerceAction,
  updateProductContentAction,
  updateOfferAffiliateAction,
} from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
      <Link
        href={"/admin/products" as Route}
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Alle producten
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{product.name}</h1>
      <p className="text-muted-foreground text-sm">{product.brands?.name}</p>

      <form
        action={updateProductContentAction}
        className="border-border mt-8 space-y-4 border-t pt-6"
      >
        <input type="hidden" name="productId" value={product.id} />
        <h2 className="text-lg font-semibold">Content &amp; specs</h2>
        <div className="space-y-2">
          <Label htmlFor="name">Naam</Label>
          <Input id="name" name="name" defaultValue={product.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary">Samenvatting</Label>
          <Input id="summary" name="summary" defaultValue={product.summary ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Omschrijving</Label>
          <textarea
            id="description"
            name="description"
            defaultValue={product.description ?? ""}
            rows={5}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="imagePath">Image path</Label>
          <Input id="imagePath" name="imagePath" defaultValue={product.image_path ?? ""} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="capacityKwh">Capaciteit (kWh)</Label>
            <Input
              id="capacityKwh"
              name="capacityKwh"
              type="number"
              step="0.01"
              defaultValue={product.capacity_kwh ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="powerKw">Vermogen (kW)</Label>
            <Input
              id="powerKw"
              name="powerKw"
              type="number"
              step="0.01"
              defaultValue={product.power_kw ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cycles">Cycli</Label>
            <Input id="cycles" name="cycles" type="number" defaultValue={product.cycles ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="warrantyYears">Garantie (jaar)</Label>
            <Input
              id="warrantyYears"
              name="warrantyYears"
              type="number"
              defaultValue={product.warranty_years ?? ""}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contentStatus">Status</Label>
          <Select id="contentStatus" name="status" defaultValue={product.status}>
            <option value="draft">Concept</option>
            <option value="published">Gepubliceerd</option>
            <option value="archived">Gearchiveerd</option>
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="expandable" defaultChecked={product.expandable} />
          Uitbreidbaar
        </label>
        <Button type="submit">Content opslaan</Button>
      </form>

      <form
        action={updateProductCommerceAction}
        className="border-border mt-8 space-y-4 border-t pt-6"
      >
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

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="sellable" defaultChecked={product.sellable} />
          Verkoopbaar via eigen shop (checkout per product)
        </label>

        <Button type="submit">Opslaan</Button>
      </form>

      {offers.length > 0 && (
        <div className="mt-10 space-y-8">
          <h2 className="text-lg font-semibold">Aanbiedingen &amp; affiliate</h2>
          {offers.map((offer) => (
            <form
              key={offer.id}
              action={updateOfferAffiliateAction}
              className="border-border space-y-3 rounded-2xl border p-4"
            >
              <input type="hidden" name="offerId" value={offer.id} />
              <input type="hidden" name="productId" value={product.id} />
              <p className="font-medium">
                {formatPrice(offer.price_cents)} · {offer.stock_status}
                {offer.affiliate_link_status ? ` · link: ${offer.affiliate_link_status}` : ""}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor={`price-${offer.id}`}>Prijs (centen)</Label>
                  <Input
                    id={`price-${offer.id}`}
                    name="priceCents"
                    type="number"
                    min={0}
                    defaultValue={offer.price_cents}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`linkStatus-${offer.id}`}>Linkstatus</Label>
                  <Select
                    id={`linkStatus-${offer.id}`}
                    name="affiliateLinkStatus"
                    defaultValue={offer.affiliate_link_status ?? "pending"}
                  >
                    <option value="ok">ok</option>
                    <option value="pending">pending</option>
                    <option value="broken">broken</option>
                  </Select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor={`linkNote-${offer.id}`}>Link-notitie</Label>
                  <Input
                    id={`linkNote-${offer.id}`}
                    name="affiliateLinkNote"
                    defaultValue={offer.affiliate_link_note ?? ""}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`deeplink-${offer.id}`}>Product-deeplink</Label>
                  <Input
                    id={`deeplink-${offer.id}`}
                    name="affiliateDeeplink"
                    defaultValue={offer.affiliate_deeplink ?? ""}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`url-${offer.id}`}>Fallback URL</Label>
                  <Input
                    id={`url-${offer.id}`}
                    name="affiliateUrl"
                    defaultValue={offer.affiliate_url ?? ""}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`network-${offer.id}`}>Netwerk</Label>
                  <Input
                    id={`network-${offer.id}`}
                    name="affiliateNetwork"
                    defaultValue={offer.affiliate_network ?? ""}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`type-${offer.id}`}>Commissietype</Label>
                  <Select
                    id={`type-${offer.id}`}
                    name="commissionType"
                    defaultValue={offer.commission_type ?? ""}
                  >
                    <option value="">-</option>
                    <option value="cps">CPS (%)</option>
                    <option value="cpa">CPA (vast)</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`rate-${offer.id}`}>Commissie % (decimal)</Label>
                  <Input
                    id={`rate-${offer.id}`}
                    name="commissionRate"
                    step="0.0001"
                    defaultValue={offer.commission_rate ?? ""}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`fixed-${offer.id}`}>Vaste commissie (centen)</Label>
                  <Input
                    id={`fixed-${offer.id}`}
                    name="commissionCentsFixed"
                    type="number"
                    defaultValue={offer.commission_cents_fixed ?? ""}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor={`source-${offer.id}`}>Bron-URL (verification gate)</Label>
                <Input
                  id={`source-${offer.id}`}
                  name="commissionSourceUrl"
                  defaultValue={offer.commission_source_url ?? ""}
                />
              </div>
              <Button type="submit" size="sm" variant="outline">
                Affiliate opslaan
              </Button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
