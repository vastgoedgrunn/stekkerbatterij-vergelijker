"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Menu, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function MobileNav({ items }: { items: readonly { href: Route; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Sluit het menu bij navigatie naar een andere route.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menu openen"
        className="hover:bg-accent flex size-10 items-center justify-center rounded-lg transition-colors"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Menu sluiten"
            onClick={() => setOpen(false)}
            className="animate-fade-in absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <div className="bg-background animate-slide-in-right absolute inset-y-0 right-0 flex w-[82%] max-w-sm flex-col gap-1 p-4 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Sluiten"
                className="hover:bg-accent flex size-9 items-center justify-center rounded-lg"
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
                  className={cn(
                    "rounded-lg px-3 py-3 text-base font-medium transition-colors",
                    active ? "bg-accent text-accent-foreground" : "hover:bg-accent",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="mt-auto flex flex-col gap-3 pt-4">
              <Link
                href="/account"
                className="hover:bg-accent flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium"
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
        </div>
      )}
    </div>
  );
}
