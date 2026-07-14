"use client";

import * as React from "react";
import { businessRules } from "@/config/business-rules";

const STORAGE_KEY = "sbv:compare";
const MAX = businessRules.comparison.maxItems;

interface CompareContextValue {
  slugs: string[];
  isSelected: (slug: string) => boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  max: number;
  isFull: boolean;
}

const CompareContext = React.createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = React.useState<string[]>([]);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Bewust: eenmalige hydratie uit localStorage na mount voorkomt
          // hydration-mismatch (server rendert lege selectie).
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSlugs(parsed.filter((s): s is string => typeof s === "string").slice(0, MAX));
        }
      }
    } catch {
      // localStorage niet beschikbaar; negeer.
    }
  }, []);

  const persist = React.useCallback((next: string[]) => {
    setSlugs(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // negeer
    }
  }, []);

  const value = React.useMemo<CompareContextValue>(
    () => ({
      slugs,
      isSelected: (slug) => slugs.includes(slug),
      toggle: (slug) => {
        if (slugs.includes(slug)) {
          persist(slugs.filter((s) => s !== slug));
        } else if (slugs.length < MAX) {
          persist([...slugs, slug]);
        }
      },
      remove: (slug) => persist(slugs.filter((s) => s !== slug)),
      clear: () => persist([]),
      max: MAX,
      isFull: slugs.length >= MAX,
    }),
    [slugs, persist],
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
