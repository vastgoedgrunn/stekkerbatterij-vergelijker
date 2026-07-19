"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Route } from "next";

type NavLink = { href: Route; label: string };

const groups: { title: string; links: NavLink[] }[] = [
  {
    title: "Inzicht",
    links: [
      { href: "/admin" as Route, label: "Dashboard" },
      { href: "/admin/analytics" as Route, label: "Analytics" },
      { href: "/admin/revenue" as Route, label: "Omzet" },
      { href: "/admin/clicks" as Route, label: "Affiliate-kliks" },
    ],
  },
  {
    title: "Commerce",
    links: [
      { href: "/admin/leads" as Route, label: "Leads" },
      { href: "/admin/orders" as Route, label: "Orders" },
    ],
  },
  {
    title: "Catalogus",
    links: [
      { href: "/admin/products" as Route, label: "Producten" },
      { href: "/admin/catalog" as Route, label: "Catalogus-health" },
      { href: "/admin/suppliers" as Route, label: "Leveranciers" },
    ],
  },
  {
    title: "Ops",
    links: [
      { href: "/admin/support" as Route, label: "Support" },
      { href: "/admin/changes" as Route, label: "Reviewwachtrij" },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  pathname,
  pendingChanges,
  onNavigate,
}: {
  pathname: string;
  pendingChanges: number;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="text-muted-foreground mb-2 px-3 text-[11px] font-semibold tracking-wide uppercase">
            {group.title}
          </p>
          <nav className="space-y-0.5">
            {group.links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground",
                  )}
                >
                  {link.label}
                  {link.href === ("/admin/changes" as Route) && pendingChanges > 0 && (
                    <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                      {pendingChanges}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}

export function AdminNav({ pendingChanges = 0 }: { pendingChanges?: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="border-border bg-card/80 sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3 lg:hidden">
        <div>
          <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            Beheer
          </p>
          <p className="text-sm font-bold tracking-tight">Admin</p>
        </div>
        <button
          type="button"
          className="border-border hover:bg-muted inline-flex size-10 items-center justify-center rounded-lg border"
          aria-label={open ? "Menu sluiten" : "Menu openen"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-border bg-card fixed inset-0 z-50 overflow-y-auto border-r px-4 py-6 lg:hidden">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-lg font-bold tracking-tight">Admin</p>
            <button
              type="button"
              className="border-border hover:bg-muted inline-flex size-10 items-center justify-center rounded-lg border"
              aria-label="Menu sluiten"
              onClick={() => setOpen(false)}
            >
              <X className="size-5" />
            </button>
          </div>
          <NavLinks
            pathname={pathname}
            pendingChanges={pendingChanges}
            onNavigate={() => setOpen(false)}
          />
          <div className="border-border mt-8 border-t pt-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground text-sm">
              ← Terug naar site
            </Link>
          </div>
        </div>
      ) : null}

      <aside className="border-border bg-card/50 hidden w-60 shrink-0 border-r px-4 py-8 lg:block">
        <div className="mb-8">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Beheer
          </p>
          <Link href={"/admin" as Route} className="text-lg font-bold tracking-tight">
            Admin
          </Link>
        </div>
        <NavLinks pathname={pathname} pendingChanges={pendingChanges} />
        <div className="border-border mt-8 border-t pt-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground text-sm">
            ← Terug naar site
          </Link>
        </div>
      </aside>
    </>
  );
}
