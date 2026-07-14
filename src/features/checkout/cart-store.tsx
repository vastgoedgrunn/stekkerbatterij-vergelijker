"use client";

import * as React from "react";
import { breakdownFromGross } from "./vat";
import type { CartItem, CartTotals } from "./types";

const STORAGE_KEY = "sbv:cart";
/** Voorzichtige bovengrens per regel om onzin-invoer te weren. */
const MAX_QTY = 20;

interface CartContextValue {
  items: CartItem[];
  totals: CartTotals;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (offerId: string, quantity: number) => void;
  remove: (offerId: string) => void;
  clear: () => void;
  has: (offerId: string) => boolean;
}

const CartContext = React.createContext<CartContextValue | null>(null);

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.productId === "string" &&
    typeof v.offerId === "string" &&
    typeof v.slug === "string" &&
    typeof v.name === "string" &&
    typeof v.unitPriceCents === "number" &&
    typeof v.quantity === "number"
  );
}

function computeTotals(items: CartItem[]): CartTotals {
  const grossTotal = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const { subtotalCents, vatCents, totalCents, vatRate } = breakdownFromGross(grossTotal);
  return { subtotalCents, vatCents, totalCents, vatRate, itemCount };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Eenmalige hydratie na mount voorkomt hydration-mismatch
          // (server rendert een lege mand).
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setItems(parsed.filter(isCartItem));
        }
      }
    } catch {
      // localStorage niet beschikbaar; negeer.
    }
  }, []);

  const persist = React.useCallback((next: CartItem[]) => {
    setItems(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // negeer
    }
  }, []);

  const clampQty = (qty: number) => Math.max(1, Math.min(MAX_QTY, Math.floor(qty)));

  const value = React.useMemo<CartContextValue>(
    () => ({
      items,
      totals: computeTotals(items),
      add: (item, quantity = 1) => {
        const existing = items.find((i) => i.offerId === item.offerId);
        if (existing) {
          persist(
            items.map((i) =>
              i.offerId === item.offerId ? { ...i, quantity: clampQty(i.quantity + quantity) } : i,
            ),
          );
        } else {
          persist([...items, { ...item, quantity: clampQty(quantity) }]);
        }
      },
      setQuantity: (offerId, quantity) => {
        if (quantity <= 0) {
          persist(items.filter((i) => i.offerId !== offerId));
          return;
        }
        persist(
          items.map((i) => (i.offerId === offerId ? { ...i, quantity: clampQty(quantity) } : i)),
        );
      },
      remove: (offerId) => persist(items.filter((i) => i.offerId !== offerId)),
      clear: () => persist([]),
      has: (offerId) => items.some((i) => i.offerId === offerId),
    }),
    [items, persist],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart moet binnen een CartProvider gebruikt worden.");
  }
  return ctx;
}
