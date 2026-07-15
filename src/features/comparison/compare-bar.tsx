"use client";

import * as React from "react";
import Link from "next/link";
import { GitCompare, X } from "lucide-react";
import { useCompare } from "./compare-store";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COMPARE_BAR_SPACE = "calc(5.5rem + env(safe-area-inset-bottom, 0px))";

export function CompareBar() {
  const { items, slugs, clear, remove } = useCompare();

  React.useEffect(() => {
    if (slugs.length === 0) {
      document.documentElement.style.setProperty("--compare-bar-space", "0px");
      return;
    }
    document.documentElement.style.setProperty("--compare-bar-space", COMPARE_BAR_SPACE);
    return () => {
      document.documentElement.style.setProperty("--compare-bar-space", "0px");
    };
  }, [slugs.length]);

  if (slugs.length === 0) return null;

  return (
    <div
      className="animate-fade-up fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="border-border bg-card/95 mx-auto flex w-full max-w-4xl flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 shadow-[var(--shadow-xl)] backdrop-blur-xl">
        <span className="text-primary flex items-center gap-2 text-sm font-semibold">
          <GitCompare className="size-4" />
          {slugs.length} geselecteerd
        </span>
        <ul className="flex flex-1 flex-wrap gap-2">
          {items.map((item) => (
            <li
              key={item.slug}
              className="bg-muted flex items-center gap-1 rounded-full py-1 pr-1 pl-3 text-xs"
            >
              <span className="max-w-[10rem] truncate">{item.name}</span>
              <button
                type="button"
                onClick={() => remove(item.slug)}
                className="hover:bg-background flex size-11 min-h-11 min-w-11 items-center justify-center rounded-full"
                aria-label={`Verwijder ${item.name}`}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clear}
            className="text-muted-foreground min-h-11 px-2 text-sm hover:underline"
          >
            Wissen
          </button>
          <Link
            href={{ pathname: "/vergelijken", query: { ids: slugs.join(",") } }}
            className={cn(buttonVariants({ size: "sm" }), "min-h-11")}
          >
            Vergelijk nu
          </Link>
        </div>
      </div>
    </div>
  );
}
