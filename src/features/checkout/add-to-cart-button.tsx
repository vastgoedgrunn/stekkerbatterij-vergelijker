"use client";

import * as React from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "./cart-store";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/observability/analytics";
import type { CartItem } from "./types";

/**
 * "Koop bij ons"-knop voor de eigen (self) aanbieding. Voegt de aanbieding toe
 * aan de client-side winkelmand. Wordt uitsluitend gerenderd wanneer de
 * checkout-flag aan staat én het product een leverancier heeft (zie offer-table).
 */
export function AddToCartButton({ item }: { item: Omit<CartItem, "quantity"> }) {
  const { add, has } = useCart();
  const inCart = has(item.offerId);

  return (
    <Button
      type="button"
      size="sm"
      variant={inCart ? "secondary" : "primary"}
      onClick={() => {
        add(item);
        trackEvent({ name: "cart_add", props: { productId: item.productId } });
      }}
      aria-label={`${item.name} in winkelmand`}
    >
      {inCart ? (
        <>
          <Check /> In mand
        </>
      ) : (
        <>
          <ShoppingCart /> Koop bij ons
        </>
      )}
    </Button>
  );
}
