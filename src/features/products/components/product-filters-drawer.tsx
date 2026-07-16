"use client";

import type { Route } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
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
  action,
}: {
  brands: Brand[];
  categories: Category[];
  filters: ProductFilters;
  action?: Route;
}) {
  const [open, setOpen] = useState(false);
  const [render, setRender] = useState(false);
  const [shown, setShown] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = "product-filters-drawer-title";

  const close = useCallback(() => setOpen(false), []);

  /* eslint-disable react-hooks/set-state-in-effect -- drawer mount/animatie */
  useEffect(() => {
    if (open) {
      setRender(true);
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const timeout = setTimeout(() => setRender(false), 300);
    return () => clearTimeout(timeout);
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Body-scroll vergrendelen, Escape sluit, focus trap, focus terug naar trigger.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    const focusId = requestAnimationFrame(() => closeRef.current?.focus());
    const trigger = triggerRef.current;

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(focusId);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <div className="md:hidden">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="product-filters-drawer-panel"
          aria-haspopup="dialog"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full gap-2")}
        >
          <SlidersHorizontal className="size-4" />
          Filters
        </button>
      </div>

      <aside className="hidden md:sticky md:top-20 md:block md:self-start">
        <ProductFilterPanel
          brands={brands}
          categories={categories}
          filters={filters}
          action={action}
        />
      </aside>

      {render && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] md:hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
            >
              <button
                type="button"
                aria-label="Filters sluiten"
                tabIndex={-1}
                onClick={close}
                className={cn(
                  "bg-foreground/45 absolute inset-0 backdrop-blur-sm transition-opacity duration-300 ease-out motion-reduce:transition-none",
                  shown ? "opacity-100" : "opacity-0",
                )}
              />
              <div
                id="product-filters-drawer-panel"
                ref={panelRef}
                className={cn(
                  "bg-background absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl shadow-xl transition-transform duration-300 ease-out motion-reduce:transition-none",
                  shown ? "translate-y-0" : "translate-y-full",
                )}
                style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
              >
                <div className="border-border flex items-center justify-between border-b px-4 py-3">
                  <span id={titleId} className="font-semibold">
                    Filters
                  </span>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={close}
                    aria-label="Sluiten"
                    className="hover:bg-accent focus-visible:ring-ring flex size-11 items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div className="overflow-y-auto p-4">
                  <ProductFilterPanel
          brands={brands}
          categories={categories}
          filters={filters}
          action={action}
        />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
