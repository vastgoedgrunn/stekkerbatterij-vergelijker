"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { ShopCatalogItem, ShopCompatTag } from "./catalog";
import { ShopProductCard } from "./shop-product-card";
import type { ShopOfferRow } from "./queries";

const FILTERS: { id: "all" | "zendure" | "anker"; label: string }[] = [
  { id: "all", label: "Alles" },
  { id: "zendure", label: "Zendure" },
  { id: "anker", label: "Anker SOLIX" },
];

export function ShopExpandFilter({
  items,
  offers,
}: {
  items: ShopCatalogItem[];
  offers: Record<string, ShopOfferRow>;
}) {
  const [filter, setFilter] = useState<"all" | "zendure" | "anker">("all");

  const visible = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.compat.includes(filter as ShopCompatTag));
  }, [filter, items]);

  return (
    <div className="space-y-4">
      <ul className="flex flex-wrap gap-1.5" aria-label="Filter uitbreidingen op merk">
        {FILTERS.map((f) => (
          <li key={f.id}>
            <button
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                filter === f.id
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <ShopProductCard key={item.slug} item={item} offer={offers[item.slug]} />
        ))}
      </div>
    </div>
  );
}
