"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Menu, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
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
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

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
    const timeout = setTimeout(() => setRender(false), 250);
    return () => clearTimeout(timeout);
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Body-scroll vergrendelen, Escape sluit, focus trap binnen de drawer.
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
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
      // Focus terug naar de opener voor toetsenbordgebruikers.
      trigger?.focus();
    };
  }, [open]);

  const isActive = (href: Route) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menu openen"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-haspopup="dialog"
        className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring flex size-10 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <Menu className="size-5" />
      </button>

      {render && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[100]"
              role="dialog"
              aria-modal="true"
              aria-label="Hoofdmenu"
            >
              <button
                aria-label="Menu sluiten"
                tabIndex={-1}
                onClick={close}
                className={cn(
                  "bg-foreground/45 absolute inset-0 backdrop-blur-sm transition-opacity duration-200 ease-out motion-reduce:transition-none",
                  shown ? "opacity-100" : "opacity-0",
                )}
              />
              <div
                id="mobile-nav-panel"
                ref={panelRef}
                className={cn(
                  "bg-background border-border/70 absolute inset-y-0 right-0 flex w-[min(20rem,88vw)] flex-col border-l shadow-xl transition-transform duration-200 ease-out will-change-transform motion-reduce:transition-none",
                  shown ? "translate-x-0" : "translate-x-full",
                )}
                style={{
                  paddingTop: "max(0.75rem, env(safe-area-inset-top))",
                  paddingRight: "max(0.75rem, env(safe-area-inset-right))",
                  paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
                }}
              >
                <div className="flex items-center justify-between gap-3 pb-4 pl-4">
                  <Link href="/" aria-label="Naar de homepage" onClick={close} className="shrink-0">
                    <Logo />
                  </Link>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={close}
                    aria-label="Menu sluiten"
                    className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring flex size-10 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <nav
                  aria-label="Hoofdmenu"
                  className="border-border/70 flex flex-col gap-1 border-t pt-4 pl-4"
                >
                  {items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={close}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-11 items-center rounded-md px-3 text-base font-medium transition-colors",
                          active
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-accent",
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="border-border/70 mt-auto flex flex-col gap-3 border-t pt-4 pl-4">
                  <Link
                    href="/account"
                    onClick={close}
                    className="text-foreground hover:bg-accent flex min-h-11 items-center gap-3 rounded-md px-3 text-base font-medium transition-colors"
                  >
                    <User className="size-5 shrink-0" /> Mijn account
                  </Link>
                  <Link
                    href="/beslishulp"
                    onClick={close}
                    className={cn(buttonVariants({ size: "lg" }), "w-full")}
                  >
                    Start de beslishulp
                  </Link>
                  <div className="flex items-center justify-between px-1 pt-1">
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
