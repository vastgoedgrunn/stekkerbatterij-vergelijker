import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Route } from "next";

const links: { href: Route; label: string }[] = [
  { href: "/admin/orders" as Route, label: "Orders" },
  { href: "/admin/products" as Route, label: "Producten" },
  { href: "/admin/suppliers" as Route, label: "Leveranciers" },
  { href: "/admin/changes" as Route, label: "Reviewwachtrij" },
];

export function AdminNav({ pendingChanges = 0 }: { pendingChanges?: number }) {
  return (
    <aside className="border-border bg-card/50 w-56 shrink-0 border-r px-4 py-8">
      <div className="mb-8">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Beheer</p>
        <Link href={"/admin" as Route} className="text-lg font-bold tracking-tight">
          Admin
        </Link>
      </div>
      <nav className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "hover:bg-muted flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            )}
          >
            {link.label}
            {link.href === ("/admin/changes" as Route) && pendingChanges > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {pendingChanges}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="border-border mt-8 border-t pt-4">
        <Link href="/" className="text-muted-foreground hover:text-foreground text-sm">
          ← Terug naar site
        </Link>
      </div>
    </aside>
  );
}
