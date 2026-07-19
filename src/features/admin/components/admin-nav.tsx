"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import {
  Activity,
  Boxes,
  Euro,
  LayoutDashboard,
  ListChecks,
  Menu,
  MessageSquare,
  MousePointerClick,
  Package,
  ShieldCheck,
  Truck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Route } from "next";

type NavLink = { href: Route; label: string; icon: LucideIcon; shortLabel?: string };

const groups: { title: string; links: NavLink[] }[] = [
  {
    title: "Inzicht",
    links: [
      { href: "/admin" as Route, label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics" as Route, label: "Analytics", icon: Activity },
      { href: "/admin/revenue" as Route, label: "Omzet", icon: Euro },
      {
        href: "/admin/clicks" as Route,
        label: "Affiliate-kliks",
        shortLabel: "Kliks",
        icon: MousePointerClick,
      },
    ],
  },
  {
    title: "Commerce",
    links: [
      { href: "/admin/leads" as Route, label: "Leads", icon: Users },
      { href: "/admin/orders" as Route, label: "Orders", icon: Package },
    ],
  },
  {
    title: "Catalogus",
    links: [
      { href: "/admin/products" as Route, label: "Producten", icon: Boxes },
      {
        href: "/admin/catalog" as Route,
        label: "Catalogus-health",
        shortLabel: "Catalogus",
        icon: ShieldCheck,
      },
      { href: "/admin/suppliers" as Route, label: "Leveranciers", icon: Truck },
    ],
  },
  {
    title: "Ops",
    links: [
      { href: "/admin/support" as Route, label: "Support", icon: MessageSquare },
      {
        href: "/admin/changes" as Route,
        label: "Reviewwachtrij",
        shortLabel: "Reviews",
        icon: ListChecks,
      },
    ],
  },
];

const allLinks = groups.flatMap((g) => g.links);

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function currentLabel(pathname: string): string {
  const match = allLinks
    .filter((link) => isActive(pathname, link.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? "Admin";
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
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="text-muted-foreground mb-1.5 px-3 text-[11px] font-semibold tracking-wide uppercase">
            {group.title}
          </p>
          <nav className="space-y-0.5" aria-label={group.title}>
            {group.links.map((link) => {
              const active = isActive(pathname, link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{link.label}</span>
                  {link.href === ("/admin/changes" as Route) && pendingChanges > 0 ? (
                    <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs tabular-nums">
                      {pendingChanges}
                    </span>
                  ) : null}
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
  const titleId = useId();
  const pageTitle = useMemo(() => currentLabel(pathname), [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="border-border bg-card/95 supports-[backdrop-filter]:bg-card/80 sticky top-0 z-40 border-b backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="min-w-0">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
              Beheer
            </p>
            <p className="truncate text-sm font-bold tracking-tight">{pageTitle}</p>
          </div>
          <button
            type="button"
            className="border-border hover:bg-muted inline-flex size-11 shrink-0 items-center justify-center rounded-xl border"
            aria-label="Menu openen"
            aria-expanded={open}
            aria-controls={titleId}
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {open ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Menu sluiten"
            onClick={() => setOpen(false)}
          />
          <div className="border-border bg-card absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col border-r shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                  Beheer
                </p>
                <p id={titleId} className="text-lg font-bold tracking-tight">
                  Admin
                </p>
              </div>
              <button
                type="button"
                className="border-border hover:bg-muted inline-flex size-11 items-center justify-center rounded-xl border"
                aria-label="Menu sluiten"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
              <NavLinks
                pathname={pathname}
                pendingChanges={pendingChanges}
                onNavigate={() => setOpen(false)}
              />
            </div>
            <div className="border-border border-t px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground text-sm font-medium"
                onClick={() => setOpen(false)}
              >
                ← Terug naar site
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <aside className="border-border bg-card/60 sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r lg:flex">
        <div className="px-5 py-7">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Beheer
          </p>
          <Link href={"/admin" as Route} className="text-lg font-bold tracking-tight">
            Admin
          </Link>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          <NavLinks pathname={pathname} pendingChanges={pendingChanges} />
        </div>
        <div className="border-border border-t px-5 py-4">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-sm font-medium"
          >
            ← Terug naar site
          </Link>
        </div>
      </aside>
    </>
  );
}
