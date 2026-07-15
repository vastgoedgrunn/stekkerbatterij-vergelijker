"use client";

import * as React from "react";
import { businessRules } from "@/config/business-rules";
import { trackEvent } from "@/lib/observability/analytics";

const STORAGE_KEY = "sbv:compare";
const MAX = businessRules.comparison.maxItems;

export interface CompareItem {
  slug: string;
  name: string;
}

interface CompareContextValue {
  items: CompareItem[];
  slugs: string[];
  isSelected: (slug: string) => boolean;
  toggle: (item: CompareItem) => void;
  remove: (slug: string) => void;
  clear: () => void;
  max: number;
  isFull: boolean;
}

const CompareContext = React.createContext<CompareContextValue | null>(null);

function parseStoredCompare(raw: string | null): CompareItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry): CompareItem | null => {
        if (typeof entry === "string") {
          return { slug: entry, name: entry.replace(/-/g, " ") };
        }
        if (
          entry &&
          typeof entry === "object" &&
          "slug" in entry &&
          typeof (entry as CompareItem).slug === "string"
        ) {
          const item = entry as CompareItem;
          return {
            slug: item.slug,
            name: typeof item.name === "string" ? item.name : item.slug.replace(/-/g, " "),
          };
        }
        return null;
      })
      .filter((item): item is CompareItem => item !== null)
      .slice(0, MAX);
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CompareItem[]>([]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydratie uit localStorage na mount
    setItems(parseStoredCompare(window.localStorage.getItem(STORAGE_KEY)));
  }, []);

  const persist = React.useCallback((next: CompareItem[]) => {
    setItems(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage niet beschikbaar
    }
  }, []);

  const value = React.useMemo<CompareContextValue>(
    () => ({
      items,
      slugs: items.map((item) => item.slug),
      isSelected: (slug) => items.some((item) => item.slug === slug),
      toggle: (item) => {
        if (items.some((i) => i.slug === item.slug)) {
          persist(items.filter((i) => i.slug !== item.slug));
        } else if (items.length < MAX) {
          persist([...items, item]);
          trackEvent({ name: "comparison_product_added", props: { productId: item.slug } });
        }
      },
      remove: (slug) => persist(items.filter((i) => i.slug !== slug)),
      clear: () => persist([]),
      max: MAX,
      isFull: items.length >= MAX,
    }),
    [items, persist],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const ctx = React.useContext(CompareContext);
  if (!ctx) {
    throw new Error("useCompare moet binnen een CompareProvider gebruikt worden.");
  }
  return ctx;
}
