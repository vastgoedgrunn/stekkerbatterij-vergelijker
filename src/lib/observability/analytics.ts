/**
 * Type-veilige wrapper rond Plausible custom events. Cookieloos en
 * privacyvriendelijk. No-op wanneer Plausible niet geladen is (bv. lokaal).
 *
 * Gedefinieerde events houden analytics consistent en voorkomen typefouten.
 */
import { getActiveExperimentProps } from "@/lib/experiments/assignment";

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
        placement?: string;
        estimatedCommissionCents?: number;
      };
    }
  | { name: "energy_cta_clicked"; props?: { placement: string; partner?: string } }
  | { name: "lead_qualified"; props?: { path: string; source?: string; productSlug?: string } }
  | {
      name: "lead_affiliate_clicked";
      props?: { partner: string; productSlug?: string; source?: string };
    }
  | {
      name: "fixed_product_lead_clicked";
      props?: { slug: string; partner: string; source?: string };
    }
  | { name: "fixed_catalog_viewed"; props?: { path: string } }
  | { name: "product_detail_viewed"; props?: { productId: string; slug: string } }
  | { name: "review_submitted"; props?: { productId: string } }
  | { name: "cart_add"; props?: { productId: string } }
  | { name: "checkout_started"; props?: { orderValueCents: number } }
  | { name: "order_paid"; props?: { orderValueCents: number } }
  | { name: "experiment_viewed"; props: { experiment: string; variant: string } };

type PlausibleFn = (
  event: string,
  options?: { props?: Record<string, string | number | boolean> },
) => void;

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

/**
 * Stuurt een custom event naar Plausible. Aan alle events behalve
 * `experiment_viewed` worden automatisch de actieve experimentvarianten
 * toegevoegd als props (`exp_<experimentId>: <variant>`), zodat je in
 * Plausible conversies per variant kunt vergelijken.
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined" || typeof window.plausible !== "function") {
    return;
  }
  const experimentProps = event.name === "experiment_viewed" ? {} : getActiveExperimentProps();
  const props = { ...experimentProps, ...event.props };
  window.plausible(event.name, Object.keys(props).length > 0 ? { props } : undefined);
}
