/** Eén e-mailbericht, provider-agnostisch. */
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendResult {
  /** True wanneer daadwerkelijk verstuurd; false bij no-op (niet geconfigureerd). */
  sent: boolean;
  id?: string;
  error?: string;
}

/** Provider-abstractie zodat we later van Resend naar SMTP kunnen wisselen. */
export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<SendResult>;
}

/** Order-gegevens die de e-mailtemplates nodig hebben (lib-lokaal, geen feature-import). */
export interface OrderEmailData {
  orderNumber: number;
  invoiceNumber: number | null;
  email: string;
  currency: string;
  vatRate: number;
  subtotalCents: number;
  vatCents: number;
  totalCents: number;
  lines: { name: string; quantity: number; lineTotalCents: number }[];
  /** Absolute URL naar de bestelstatuspagina. */
  statusUrl: string;
}

export interface ShippingEmailData extends OrderEmailData {
  carrier: string | null;
  trackingCode: string | null;
  trackingUrl: string | null;
}
