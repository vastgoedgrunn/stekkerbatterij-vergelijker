import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLink } from "@/components/layout/nav-link";

const navItems: { href: Route; label: string }[] = [
  { href: "/stekkerbatterijen", label: "Stekkerbatterijen" },
  { href: "/vaste-thuisbatterijen", label: "Vaste batterijen" },
  { href: "/vergelijken", label: "Vergelijken" },
  { href: "/beslishulp", label: "Beslishulp" },
  { href: "/beste-stekkerbatterij", label: "Top 10" },
];

export function SiteHeader() {
  return (
    <header className="border-border/70 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label="Naar de homepage" className="shrink-0">
          <Logo priority />
        </Link>

        <nav aria-label="Hoofdmenu" className="hidden items-center gap-0.5 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/beslishulp" className={cn(buttonVariants({ size: "sm" }))}>
            Beslishulp
          </Link>
        </div>

        <MobileNav items={navItems} />
      </div>
    </header>
  );
}
