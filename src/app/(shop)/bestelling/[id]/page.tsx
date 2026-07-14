import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { isFeatureEnabled } from "@/config/feature-flags";
import { getOrderSummary } from "@/features/checkout/orders.server";
import { Container } from "@/components/patterns/section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/db/database.types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bestelstatus",
  robots: { index: false, follow: false },
};

const statusMeta: Record<
  OrderStatus,
  {
    label: string;
    variant: "success" | "warning" | "muted" | "default";
    icon: typeof Clock;
    note: string;
  }
> = {
  pending: {
    label: "Wacht op betaling",
    variant: "warning",
    icon: Clock,
    note: "We wachten op de bevestiging van je betaling.",
  },
  paid: {
    label: "Betaald",
    variant: "success",
    icon: CheckCircle2,
    note: "Bedankt! Je betaling is ontvangen en je bestelling wordt verwerkt.",
  },
  shipped: {
    label: "Verzonden",
    variant: "success",
    icon: CheckCircle2,
    note: "Je bestelling is onderweg.",
  },
  failed: {
    label: "Betaling mislukt",
    variant: "muted",
    icon: XCircle,
    note: "De betaling is niet gelukt. Je kunt het opnieuw proberen.",
  },
  cancelled: {
    label: "Geannuleerd",
    variant: "muted",
    icon: XCircle,
    note: "Deze bestelling is geannuleerd.",
  },
  refunded: {
    label: "Terugbetaald",
    variant: "muted",
    icon: XCircle,
    note: "Het bedrag is terugbetaald.",
  },
};

export default async function OrderStatusPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isFeatureEnabled("checkout")) notFound();

  const { id } = await params;
  const order = await getOrderSummary(id);
  if (!order) notFound();

  const meta = statusMeta[order.status];
  const StatusIcon = meta.icon;
  const canRetry =
    (order.status === "pending" || order.status === "failed") && order.payment?.checkoutUrl;

  return (
    <main>
      <Container className="py-10">
        <div className="mx-auto max-w-2xl">
          <div className="border-border bg-card rounded-2xl border p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <StatusIcon className="text-primary size-7" aria-hidden />
              <div>
                <p className="text-muted-foreground text-sm">Bestelling #{order.orderNumber}</p>
                <h1 className="text-2xl font-bold tracking-tight">
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </h1>
              </div>
            </div>
            <p className="text-muted-foreground mt-4 text-sm">{meta.note}</p>

            {order.invoiceNumber !== null && (
              <p className="text-muted-foreground mt-2 text-sm">
                Factuurnummer:{" "}
                <span className="text-foreground font-medium">{order.invoiceNumber}</span>
              </p>
            )}

            <dl className="border-border mt-6 space-y-2 border-t pt-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Besteld op</dt>
                <dd>{formatDate(order.placedAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">E-mail</dt>
                <dd>{order.email}</dd>
              </div>
            </dl>

            <ul className="border-border mt-6 space-y-3 border-t pt-6 text-sm">
              {order.lines.map((line) => (
                <li key={line.id} className="flex justify-between gap-3">
                  <span className="min-w-0">
                    <span className="text-muted-foreground">{line.quantity}× </span>
                    {line.name}
                  </span>
                  <span className="whitespace-nowrap">{formatPrice(line.lineTotalCents)}</span>
                </li>
              ))}
            </ul>

            <dl className="border-border mt-6 space-y-2 border-t pt-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotaal (excl. btw)</dt>
                <dd>{formatPrice(order.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Btw ({Math.round(order.vatRate * 100)}%)</dt>
                <dd>{formatPrice(order.vatCents)}</dd>
              </div>
              <div className="border-border flex justify-between border-t pt-2 text-base font-bold">
                <dt>Totaal</dt>
                <dd>{formatPrice(order.totalCents)}</dd>
              </div>
            </dl>

            {canRetry && (
              <a
                href={order.payment!.checkoutUrl!}
                className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full")}
              >
                Betaling afronden
              </a>
            )}
            <Link
              href="/batterijen"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-2 w-full")}
            >
              Verder winkelen
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
