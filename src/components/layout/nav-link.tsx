"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Navigatielink met actieve-status (onderstreping + kleur) op basis van
 * het huidige pad. Client-component omdat het `usePathname` gebruikt.
 */
export function NavLink({ href, children }: { href: Route; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      <span
        className={cn(
          "bg-primary absolute inset-x-3 -bottom-px h-0.5 rounded-full transition-transform duration-300",
          active ? "scale-x-100" : "scale-x-0",
        )}
      />
    </Link>
  );
}
