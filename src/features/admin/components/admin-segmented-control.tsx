import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";

export function AdminSegmentedControl({
  items,
  active,
}: {
  items: { value: string; label: string; href: Route }[];
  active: string;
}) {
  return (
    <div className="-mx-1 flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-1 pb-1 [&::-webkit-scrollbar]:hidden">
      {items.map((item) => {
        const isActive = active === item.value;
        return (
          <Link
            key={item.value}
            href={item.href}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
