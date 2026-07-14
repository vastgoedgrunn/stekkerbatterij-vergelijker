"use client";

import Link from "next/link";
import { GitCompare, X } from "lucide-react";
import { useCompare } from "./compare-store";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CompareBar() {
  const { slugs, clear, remove } = useCompare();

  if (slugs.length === 0) return null;

  return (
    <div className="border-border bg-background/95 fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <GitCompare className="size-4" />
          {slugs.length} geselecteerd
        </span>
        <ul className="flex flex-1 flex-wrap gap-2">
          {slugs.map((slug) => (
            <li
              key={slug}
              className="bg-muted flex items-center gap-1 rounded-full py-1 pr-1 pl-3 text-xs"
            >
              <span className="max-w-[10rem] truncate">{slug.replace(/-/g, " ")}</span>
              <button
                type="button"
                onClick={() => remove(slug)}
                className="hover:bg-background rounded-full p-1"
                aria-label={`Verwijder ${slug}`}
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clear}
            className="text-muted-foreground text-sm hover:underline"
          >
            Wissen
          </button>
          <Link
            href={{ pathname: "/vergelijken", query: { ids: slugs.join(",") } }}
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Vergelijk nu
          </Link>
        </div>
      </div>
    </div>
  );
}
