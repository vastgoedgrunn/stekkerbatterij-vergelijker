import type { OrderStatus, PaymentStatus } from "@/lib/db/database.types";

/**
 * Regel in de client-side winkelmand. `unitPriceCents` is de consumentenprijs
 * inclusief btw (zoals getoond in de offer-tabel). De server her-valideert de
 * prijs bij het afrekenen, dus deze waarde is puur voor weergave.
 */
export interface CartItem {
  productId: string;
  offerId: string;
  slug: string;
  name: string;
  brandName: string | null;
  imagePath: string | null;
  unitPriceCents: number;
  quantity: number;
}

export interface CartTotals {
  subtotalCents: number;
  vatCents: number;
  totalCents: number;
  vatRate: number;
  itemCount: number;
}

/** Publiek-veilige samenvatting van een order voor de statuspagina. */
export interface OrderSummary {
  id: string;
  orderNumber: number;
  invoiceNumber: number | null;
  email: string;
  status: OrderStatus;
  currency: string;
  vatRate: number;
  subtotalCents: number;
  vatCents: number;
  totalCents: number;
  placedAt: string;
  paidAt: string | null;
  lines: OrderSummaryLine[];
  payment: OrderSummaryPayment | null;
}

export interface OrderSummaryLine {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface OrderSummaryPayment {
  status: PaymentStatus;
  method: string | null;
  checkoutUrl: string | null;
}
