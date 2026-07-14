import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import type { ProductOffer } from "@/features/products/types";
import type { StockStatus } from "@/lib/db/database.types";

const stockLabels: Record<
  StockStatus,
  { label: string; variant: "success" | "warning" | "muted" }
> = {
  in_stock: { label: "Op voorraad", variant: "success" },
  preorder: { label: "Pre-order", variant: "warning" },
  out_of_stock: { label: "Uitverkocht", variant: "muted" },
  unknown: { label: "Onbekend", variant: "muted" },
};

export function OfferTable({ offers }: { offers: ProductOffer[] }) {
  if (offers.length === 0) {
    return (
      <p className="text-muted-foreground border-border rounded-lg border border-dashed p-6 text-sm">
        Er zijn nog geen aanbieders bekend voor dit product.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Aanbieder</TableHead>
          <TableHead>Beschikbaarheid</TableHead>
          <TableHead>Levertijd</TableHead>
          <TableHead className="text-right">Prijs</TableHead>
          <TableHead className="sr-only">Actie</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {offers.map((offer) => {
          const stock = stockLabels[offer.stockStatus];
          return (
            <TableRow key={offer.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{offer.merchantName}</span>
                  {offer.isSelf && <Badge variant="default">Onze prijs</Badge>}
                  {offer.isSponsored && <Badge variant="muted">Advertentie</Badge>}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={stock.variant}>{stock.label}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {offer.deliveryDays !== null ? `${offer.deliveryDays} werkdagen` : "—"}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatPrice(offer.priceCents)}
              </TableCell>
              <TableCell className="text-right">
                {offer.affiliateUrl ? (
                  <a
                    href={offer.affiliateUrl}
                    target="_blank"
                    rel={offer.isSponsored ? "sponsored noopener" : "noopener"}
                    className={cn(buttonVariants({ size: "sm" }))}
                  >
                    Bekijk <ExternalLink className="size-4" />
                  </a>
                ) : (
                  <span className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                    Via ons
                  </span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
