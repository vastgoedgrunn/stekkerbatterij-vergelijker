/**
 * Type-veilige wrapper rond Plausible custom events. Cookieloos en
 * privacyvriendelijk. No-op wanneer Plausible niet geladen is (bv. lokaal).
 *
 * Gedefinieerde events houden analytics consistent en voorkomen typefouten.
 */
export type AnalyticsEvent =
  | { name: "comparison_started"; props?: { count: number } }
  | { name: "comparison_product_added"; props?: { productId: string } }
  | { name: "decision_wizard_completed"; props?: { recommendedId: string } }
  | { name: "price_alert_created"; props?: { productId: string } }
  | {
      name: "offer_clicked";
      props?: {
        productId: string;
        merchant: string;
        offerId?: string;
        estimatedCommissionCents?: number;
      };
    }
  | { name: "energy_cta_clicked"; props?: { placement: string; partner?: string } }
  | { name: "lead_qualified"; props?: { path: string; source?: string } }
  | { name: "lead_affiliate_clicked"; props?: { partner: string } }
  | { name: "product_detail_viewed"; props?: { productId: string; slug: string } }
  | { name: "review_submitted"; props?: { productId: string } }
  | { name: "cart_add"; props?: { productId: string } }
  | { name: "checkout_started"; props?: { orderValueCents: number } }
  | { name: "order_paid"; props?: { orderValueCents: number } };

type PlausibleFn = (
  event: string,
  options?: { props?: Record<string, string | number | boolean> },
) => void;

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined" || typeof window.plausible !== "function") {
    return;
  }
  window.plausible(event.name, event.props ? { props: event.props } : undefined);
}
