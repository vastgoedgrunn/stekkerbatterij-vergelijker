"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  SHOP_BUNDLES,
  SHOP_ITEMS,
  SHOP_SECTIONS,
  type ShopBundle,
  type ShopCatalogItem,
  type ShopCompatTag,
  type ShopSectionId,
} from "./catalog";
import { ShopProductCard } from "./shop-product-card";
import { ShopBundleCard } from "./shop-bundle-card";
import type { ShopOfferRow } from "./queries";

type SectionFilter = "all" | ShopSectionId;
type BrandFilter = "all" | "zendure" | "anker";

const CATEGORY_FILTERS: { id: SectionFilter; label: string }[] = [
  { id: "all", label: "Alles tonen" },
  ...SHOP_SECTIONS.map((s) => ({ id: s.id as SectionFilter, label: s.title })),
];

const BRAND_FILTERS: { id: BrandFilter; label: string }[] = [
  { id: "all", label: "Alle merken" },
  { id: "zendure", label: "Zendure" },
  { id: "anker", label: "Anker SOLIX" },
];

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function itemMatchesQuery(item: ShopCatalogItem, query: string): boolean {
  if (!query) return true;
  const haystack = [item.name, item.brand, item.summary, ...item.labels, item.slug]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function bundleMatchesQuery(bundle: ShopBundle, items: ShopCatalogItem[], query: string): boolean {
  if (!query) return true;
  if (`${bundle.name} ${bundle.summary}`.toLowerCase().includes(query)) return true;
  return bundle.itemSlugs.some((slug) => {
    const item = items.find((i) => i.slug === slug);
    return item ? itemMatchesQuery(item, query) : false;
  });
}

function itemMatchesBrand(item: ShopCatalogItem, brand: BrandFilter): boolean {
  if (brand === "all") return true;
  return item.compat.includes(brand as ShopCompatTag);
}

export function ShopCatalog({ offers }: { offers: Record<string, ShopOfferRow | undefined> }) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<SectionFilter>("all");
  const [brand, setBrand] = useState<BrandFilter>("all");
  const deferredQuery = useDeferredValue(normalize(query));

  const filteredItems = useMemo(() => {
    return SHOP_ITEMS.filter((item) => {
      if (section !== "all" && section !== "pakketten" && item.section !== section) {
        return false;
      }
      if (section === "pakketten") return false;
      if (!itemMatchesQuery(item, deferredQuery)) return false;
      if (item.section === "uitbreiden" && !itemMatchesBrand(item, brand)) return false;
      return true;
    });
  }, [deferredQuery, section, brand]);

  const filteredBundles = useMemo(() => {
    if (section !== "all" && section !== "pakketten") return [];
    return SHOP_BUNDLES.filter((bundle) => bundleMatchesQuery(bundle, SHOP_ITEMS, deferredQuery));
  }, [deferredQuery, section]);

  const visibleSections = useMemo(() => {
    if (section === "pakketten") return [];
    const productSections = SHOP_SECTIONS.filter(
      (s): s is (typeof SHOP_SECTIONS)[number] & { id: Exclude<ShopSectionId, "pakketten"> } =>
        s.id !== "pakketten",
    );
    if (section !== "all") {
      return productSections.filter((s) => s.id === section);
    }
    return productSections;
  }, [section]);

  const showBrandFilter =
    section === "all" || section === "uitbreiden"
      ? filteredItems.some((i) => i.section === "uitbreiden") ||
        SHOP_ITEMS.some((i) => i.section === "uitbreiden")
      : false;

  const totalCount = filteredItems.length + filteredBundles.length;
  const showBundles = filteredBundles.length > 0;

  return (
    <div className="space-y-8">
      <div className="border-border/70 bg-background/90 sticky top-16 z-30 space-y-3 rounded-2xl border p-3 shadow-[var(--shadow-xs)] backdrop-blur-xl sm:p-4">
        <label className="relative block">
          <span className="sr-only">Zoeken in de shop</span>
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek op product, merk of type…"
            className="h-11 pr-10 pl-10"
            autoComplete="off"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1.5"
              aria-label="Zoekopdracht wissen"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </label>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <ul
            className="flex [scrollbar-width:none] gap-1 overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Filter op categorie"
          >
            {CATEGORY_FILTERS.map((filter) => (
              <li key={filter.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSection(filter.id);
                    if (filter.id !== "all" && filter.id !== "uitbreiden") {
                      setBrand("all");
                    }
                  }}
                  className={cn(
                    "inline-flex rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                    section === filter.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  aria-pressed={section === filter.id}
                >
                  {filter.label}
                </button>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground shrink-0 text-xs sm:text-sm">
            {totalCount === 0
              ? "Geen resultaten"
              : `${totalCount} ${totalCount === 1 ? "resultaat" : "resultaten"}`}
          </p>
        </div>

        {showBrandFilter ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="Filter uitbreidingen op merk">
            {BRAND_FILTERS.map((filter) => (
              <li key={filter.id}>
                <button
                  type="button"
                  onClick={() => setBrand(filter.id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                    brand === filter.id
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={brand === filter.id}
                >
                  {filter.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {totalCount === 0 ? (
        <div className="border-border/70 rounded-2xl border border-dashed px-6 py-12 text-center">
          <p className="font-semibold">Geen producten gevonden</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Probeer een andere zoekterm of kies &quot;Alles tonen&quot;.
          </p>
          <button
            type="button"
            className="text-primary mt-4 text-sm font-semibold underline-offset-4 hover:underline"
            onClick={() => {
              setQuery("");
              setSection("all");
              setBrand("all");
            }}
          >
            Filters wissen
          </button>
        </div>
      ) : (
        <div className="space-y-14 sm:space-y-16">
          {visibleSections.map((sec) => {
            const items = filteredItems.filter((item) => item.section === sec.id);
            if (items.length === 0) return null;
            return (
              <section key={sec.id} id={`section-${sec.id}`} className="scroll-mt-40">
                <header className="mb-5 max-w-2xl">
                  <h2 className="text-2xl font-bold tracking-tight">{sec.title}</h2>
                  <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed sm:text-base">
                    {sec.subtitle}
                  </p>
                </header>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <ShopProductCard key={item.slug} item={item} offer={offers[item.slug]} />
                  ))}
                </div>
              </section>
            );
          })}

          {showBundles ? (
            <section id="section-pakketten" className="scroll-mt-40">
              <header className="mb-5 max-w-2xl">
                <h2 className="text-2xl font-bold tracking-tight">Slimme pakketten</h2>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed sm:text-base">
                  Kant-en-klare sets voor meten, sturen of uitbreiden. Bestel elk onderdeel met één
                  klik.
                </p>
              </header>
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredBundles.map((bundle) => (
                  <ShopBundleCard
                    key={bundle.slug}
                    bundle={bundle}
                    items={SHOP_ITEMS}
                    offers={offers}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
