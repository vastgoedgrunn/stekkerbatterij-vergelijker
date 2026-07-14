import { businessRules } from "@/config/business-rules";

const priceFormatter = new Intl.NumberFormat(businessRules.locale, {
  style: "currency",
  currency: businessRules.currency,
});

const numberFormatter = new Intl.NumberFormat(businessRules.locale);

const dateFormatter = new Intl.DateTimeFormat(businessRules.locale, {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Formatteert een bedrag in centen naar een lokale valutastring. */
export function formatPrice(cents: number): string {
  return priceFormatter.format(cents / 100);
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  if (options) {
    return new Intl.NumberFormat(businessRules.locale, options).format(value);
  }
  return numberFormatter.format(value);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return dateFormatter.format(date);
}
