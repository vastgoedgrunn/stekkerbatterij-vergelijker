import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/config/feature-flags";
import { CartView } from "@/features/checkout/cart-view";

export const metadata: Metadata = {
  title: "Winkelmand",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  // Volledig achter de checkout-flag: zolang die uit staat bestaat de pagina niet.
  if (!isFeatureEnabled("checkout")) notFound();

  return (
    <main id="main-content">
      <CartView />
    </main>
  );
}
