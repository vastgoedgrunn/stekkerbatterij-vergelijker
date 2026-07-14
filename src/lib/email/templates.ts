import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/config/site";
import type { EmailMessage, OrderEmailData, ShippingEmailData } from "./types";

function layout(heading: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="nl">
  <body style="margin:0;background:#f7f8f6;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f1512;">
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <h1 style="font-size:20px;margin:0 0 16px;">${siteConfig.name}</h1>
      <div style="background:#ffffff;border:1px solid #e6e8e4;border-radius:16px;padding:24px;">
        <h2 style="font-size:18px;margin:0 0 12px;">${heading}</h2>
        ${bodyHtml}
      </div>
      <p style="color:#6b7280;font-size:12px;margin:16px 0 0;text-align:center;">
        ${siteConfig.name} · Dit is een automatische e-mail.
      </p>
    </div>
  </body>
</html>`;
}

function linesTableHtml(data: OrderEmailData): string {
  const rows = data.lines
    .map(
      (l) =>
        `<tr>
          <td style="padding:6px 0;">${l.quantity}× ${escapeHtml(l.name)}</td>
          <td style="padding:6px 0;text-align:right;white-space:nowrap;">${formatPrice(
            l.lineTotalCents,
          )}</td>
        </tr>`,
    )
    .join("");

  return `<table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tbody>${rows}</tbody>
    <tfoot>
      <tr><td style="padding-top:12px;border-top:1px solid #e6e8e4;color:#6b7280;">Subtotaal (excl. btw)</td>
          <td style="padding-top:12px;border-top:1px solid #e6e8e4;text-align:right;">${formatPrice(
            data.subtotalCents,
          )}</td></tr>
      <tr><td style="color:#6b7280;">Btw (${Math.round(data.vatRate * 100)}%)</td>
          <td style="text-align:right;">${formatPrice(data.vatCents)}</td></tr>
      <tr><td style="font-weight:700;padding-top:6px;">Totaal</td>
          <td style="font-weight:700;text-align:right;padding-top:6px;">${formatPrice(
            data.totalCents,
          )}</td></tr>
    </tfoot>
  </table>`;
}

function linesTextBlock(data: OrderEmailData): string {
  const lines = data.lines.map(
    (l) => `- ${l.quantity}x ${l.name}: ${formatPrice(l.lineTotalCents)}`,
  );
  lines.push(`Subtotaal (excl. btw): ${formatPrice(data.subtotalCents)}`);
  lines.push(`Btw (${Math.round(data.vatRate * 100)}%): ${formatPrice(data.vatCents)}`);
  lines.push(`Totaal: ${formatPrice(data.totalCents)}`);
  return lines.join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Orderbevestiging + btw-factuursamenvatting (na succesvolle betaling). */
export function orderConfirmationEmail(data: OrderEmailData): EmailMessage {
  const invoiceLine =
    data.invoiceNumber !== null
      ? `<p style="margin:0 0 12px;">Factuurnummer: <strong>${data.invoiceNumber}</strong></p>`
      : "";
  const bodyHtml = `
    <p style="margin:0 0 12px;">Bedankt voor je bestelling <strong>#${data.orderNumber}</strong>. We hebben je betaling ontvangen.</p>
    ${invoiceLine}
    ${linesTableHtml(data)}
    <p style="margin:20px 0 0;">
      <a href="${data.statusUrl}" style="display:inline-block;background:#1f7a3d;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;">Bekijk je bestelling</a>
    </p>`;

  const text = [
    `Bedankt voor je bestelling #${data.orderNumber}. We hebben je betaling ontvangen.`,
    data.invoiceNumber !== null ? `Factuurnummer: ${data.invoiceNumber}` : "",
    "",
    linesTextBlock(data),
    "",
    `Bekijk je bestelling: ${data.statusUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    to: data.email,
    subject: `Bestelbevestiging #${data.orderNumber} — ${siteConfig.name}`,
    html: layout("Bedankt voor je bestelling", bodyHtml),
    text,
  };
}

/** Betaling mislukt / niet afgerond. */
export function paymentFailedEmail(data: OrderEmailData): EmailMessage {
  const bodyHtml = `
    <p style="margin:0 0 12px;">De betaling voor je bestelling <strong>#${data.orderNumber}</strong> is niet afgerond.</p>
    <p style="margin:0 0 12px;">Geen zorgen — je kunt de betaling opnieuw proberen via onderstaande knop.</p>
    <p style="margin:20px 0 0;">
      <a href="${data.statusUrl}" style="display:inline-block;background:#1f7a3d;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;">Betaling opnieuw proberen</a>
    </p>`;

  const text = [
    `De betaling voor je bestelling #${data.orderNumber} is niet afgerond.`,
    "Je kunt de betaling opnieuw proberen:",
    data.statusUrl,
  ].join("\n");

  return {
    to: data.email,
    subject: `Betaling niet afgerond — bestelling #${data.orderNumber}`,
    html: layout("Betaling niet afgerond", bodyHtml),
    text,
  };
}

/**
 * Verzend-/track&trace-bevestiging. Voorbereid voor fase 3 (verzending);
 * nog niet gekoppeld aan een trigger.
 */
export function shippingEmail(data: ShippingEmailData): EmailMessage {
  const tracking =
    data.trackingUrl && data.trackingCode
      ? `<p style="margin:0 0 12px;">Track & trace (${escapeHtml(
          data.carrier ?? "vervoerder",
        )}): <a href="${data.trackingUrl}">${escapeHtml(data.trackingCode)}</a></p>`
      : "";
  const bodyHtml = `
    <p style="margin:0 0 12px;">Je bestelling <strong>#${data.orderNumber}</strong> is verzonden.</p>
    ${tracking}
    <p style="margin:20px 0 0;">
      <a href="${data.statusUrl}" style="display:inline-block;background:#1f7a3d;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;">Bekijk je bestelling</a>
    </p>`;

  const text = [
    `Je bestelling #${data.orderNumber} is verzonden.`,
    data.trackingCode ? `Track & trace: ${data.trackingUrl ?? data.trackingCode}` : "",
    `Bekijk je bestelling: ${data.statusUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    to: data.email,
    subject: `Je bestelling #${data.orderNumber} is verzonden`,
    html: layout("Je bestelling is onderweg", bodyHtml),
    text,
  };
}
