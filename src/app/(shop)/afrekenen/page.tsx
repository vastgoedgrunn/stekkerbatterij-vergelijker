import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/config/feature-flags";
import { CheckoutView } from "@/features/checkout/checkout-view";

export const metadata: Metadata = {
  title: "Afrekenen",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  // Volledig achter de checkout-flag: zolang die uit staat bestaat de pagina niet.
  if (!isFeatureEnabled("checkout")) notFound();

  return (
    <main id="main-content">
      <CheckoutView />
    </main>
  );
}
