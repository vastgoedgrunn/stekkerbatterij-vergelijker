"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { ShopSectionId } from "./catalog";
import { SHOP_SECTIONS } from "./catalog";

export function ShopSectionNav() {
  const [active, setActive] = useState<ShopSectionId>("meten");

  useEffect(() => {
    const sections = SHOP_SECTIONS.map((s) => document.getElementById(`section-${s.id}`)).filter(
      Boolean,
    ) as HTMLElement[];
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target.id) return;
        const id = visible.target.id.replace("section-", "") as ShopSectionId;
        setActive(id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.15, 0.4, 0.7] },
    );

    for (const el of sections) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Shop categorieën"
      className="border-border/70 bg-background/90 sticky top-16 z-30 -mx-4 border-b px-4 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:px-2"
    >
      <ul className="flex gap-1 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SHOP_SECTIONS.map((section) => (
          <li key={section.id} className="shrink-0">
            <a
              href={`#section-${section.id}`}
              className={cn(
                "inline-flex rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                active === section.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              onClick={() => setActive(section.id)}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
