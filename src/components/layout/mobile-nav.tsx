"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Menu, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function MobileNav({ items }: { items: readonly { href: Route; label: string }[] }) {
  const [open, setOpen] = useState(false);
  // `render` houdt de drawer in de DOM tijdens de sluit-animatie.
  const [render, setRender] = useState(false);
  // `shown` stuurt de in/uit-transitie (na mount één frame later true).
  const [shown, setShown] = useState(false);

  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Sluit het menu bij navigatie naar een andere route.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  // Mount/unmount + transitie-timing gekoppeld aan `open`.
  /* eslint-disable react-hooks/set-state-in-effect */
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

  // Body-scroll vergrendelen, Escape sluit, focus naar sluitknop.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    const focusId = requestAnimationFrame(() => closeRef.current?.focus());
    const trigger = triggerRef.current;

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(focusId);
      // Focus terug naar de opener voor toetsenbordgebruikers.
      trigger?.focus();
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menu openen"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="hover:bg-accent flex size-10 items-center justify-center rounded-lg transition-colors"
      >
        <Menu className="size-5" />
      </button>

      {render && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Menu">
              <button
                aria-label="Menu sluiten"
                tabIndex={-1}
                onClick={() => setOpen(false)}
                className={cn(
                  "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out",
                  shown ? "opacity-100" : "opacity-0",
                )}
              />
              <div
                className={cn(
                  "bg-background absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col gap-1 p-4 shadow-xl transition-transform duration-300 ease-out will-change-transform",
                  shown ? "translate-x-0" : "translate-x-full",
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold">Menu</span>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Sluiten"
                    className="hover:bg-accent focus-visible:ring-ring flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-lg px-3 py-3 text-base font-medium transition-colors",
                        active ? "bg-accent text-accent-foreground" : "hover:bg-accent",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                <div className="border-border/70 mt-auto flex flex-col gap-3 border-t pt-4">
                  <Link
                    href="/account"
                    className="hover:bg-accent flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium transition-colors"
                  >
                    <User className="size-5" /> Mijn account
                  </Link>
                  <Link href="/beslishulp" className={cn(buttonVariants({ size: "lg" }))}>
                    Start de beslishulp
                  </Link>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-muted-foreground text-sm">Thema</span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
