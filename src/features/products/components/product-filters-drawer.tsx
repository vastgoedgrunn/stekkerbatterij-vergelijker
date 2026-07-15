"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ProductFilterPanel } from "@/features/products/components/product-filters";
import type { Brand, Category, ProductFilters } from "@/features/products/types";

export function ProductFiltersDrawer({
  brands,
  categories,
  filters,
}: {
  brands: Brand[];
  categories: Category[];
  filters: ProductFilters;
}) {
  const [open, setOpen] = useState(false);
  const [render, setRender] = useState(false);
  const [shown, setShown] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      /* eslint-disable react-hooks/set-state-in-effect -- drawer mount/animatie */
      setRender(true);
      /* eslint-enable react-hooks/set-state-in-effect */
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const timeout = setTimeout(() => setRender(false), 300);
    return () => clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const focusId = requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(focusId);
    };
  }, [open]);

  return (
    <>
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full gap-2")}
        >
          <SlidersHorizontal className="size-4" />
          Filters
        </button>
      </div>

      <aside className="hidden md:sticky md:top-20 md:block md:self-start">
        <ProductFilterPanel brands={brands} categories={categories} filters={filters} />
      </aside>

      {render && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[100] md:hidden" role="dialog" aria-modal="true">
              <button
                type="button"
                aria-label="Filters sluiten"
                tabIndex={-1}
                onClick={() => setOpen(false)}
                className={cn(
                  "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
                  shown ? "opacity-100" : "opacity-0",
                )}
              />
              <div
                className={cn(
                  "bg-background absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl shadow-xl transition-transform duration-300",
                  shown ? "translate-y-0" : "translate-y-full",
                )}
                style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
              >
                <div className="border-border flex items-center justify-between border-b px-4 py-3">
                  <span className="font-semibold">Filters</span>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Sluiten"
                    className="hover:bg-accent flex size-11 items-center justify-center rounded-lg"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div className="overflow-y-auto p-4">
                  <ProductFilterPanel brands={brands} categories={categories} filters={filters} />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
