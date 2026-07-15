"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/observability/analytics";

/** Vuurt `order_paid` één keer af op de statuspagina na succesvolle betaling. */
export function OrderPaidTracker({ orderValueCents }: { orderValueCents: number }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent({ name: "order_paid", props: { orderValueCents } });
  }, [orderValueCents]);

  return null;
}
