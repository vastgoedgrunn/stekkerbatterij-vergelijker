import Link from "next/link";
import { BatteryCharging, Menu, User } from "lucide-react";
import { siteConfig } from "@/config/site";

const navItems = [
  { href: "/batterijen", label: "Batterijen" },
  { href: "/vergelijken", label: "Vergelijken" },
  { href: "/beslishulp", label: "Beslishulp" },
  { href: "/gidsen", label: "Gidsen" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-border bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <BatteryCharging className="size-5" />
          </span>
          <span className="hidden sm:inline">{siteConfig.shortName}</span>
        </Link>

        <nav aria-label="Hoofdmenu" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:bg-accent rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/account"
            className="hover:bg-accent ml-1 flex size-10 items-center justify-center rounded-md"
            aria-label="Mijn account"
          >
            <User className="size-5" />
          </Link>
        </nav>

        <details className="relative md:hidden">
          <summary className="hover:bg-accent flex size-10 cursor-pointer list-none items-center justify-center rounded-md [&::-webkit-details-marker]:hidden">
            <Menu className="size-5" />
            <span className="sr-only">Menu openen</span>
          </summary>
          <div className="border-border bg-popover absolute right-0 mt-2 w-48 rounded-lg border p-1 shadow-md">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:bg-accent block rounded-md px-3 py-2 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/account"
              className="hover:bg-accent block rounded-md px-3 py-2 text-sm font-medium"
            >
              Account
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
