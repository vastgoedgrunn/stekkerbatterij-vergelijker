import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLink } from "@/components/layout/nav-link";

const navItems = [
  { href: "/batterijen", label: "Batterijen" },
  { href: "/vergelijken", label: "Vergelijken" },
  { href: "/beslishulp", label: "Beslishulp" },
  { href: "/gidsen", label: "Gidsen" },
] as const;

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
