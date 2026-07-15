import type { Metadata } from "next";
import Link from "next/link";
import { X } from "lucide-react";
import { getBrands, getCategories, getProducts } from "@/features/products/queries";
import { parseProductFilters } from "@/features/products/search-params";
import { ProductFiltersDrawer } from "@/features/products/components/product-filters-drawer";
import { SortSelect } from "@/features/products/components/sort-select";
import { ProductCard } from "@/components/patterns/product-card";
import { AffiliateDisclosure } from "@/components/patterns/affiliate-disclosure";
import { Container } from "@/components/patterns/section";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Alle stekkerbatterijen vergelijken",
  description:
    "Vergelijk alle plug-and-play stekkerbatterijen op prijs, capaciteit, vermogen en garantie. Onafhankelijk en actueel.",
  alternates: { canonical: "/batterijen" },
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseProductFilters(params);

  const [{ items, total, page, pageSize }, brands, categories] = await Promise.all([
    getProducts(filters),
    getBrands(),
    getCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const stringParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") stringParams[key] = value;
  }

  const pageHref = (targetPage: number) => ({
    pathname: "/batterijen" as const,
    query: { ...stringParams, pagina: String(targetPage) },
  });

  const removeHref = (key: string) => {
    const query = { ...stringParams };
    delete query[key];
    return { pathname: "/batterijen" as const, query };
  };

  const activeChips = [
    filters.search && { key: "q", label: `"${filters.search}"` },
    filters.brandSlug && {
      key: "merk",
      label: brands.find((b) => b.slug === filters.brandSlug)?.name ?? "Merk",
    },
    filters.categorySlug && {
      key: "categorie",
      label: categories.find((c) => c.slug === filters.categorySlug)?.name ?? "Categorie",
    },
    filters.minCapacity != null && { key: "minCap", label: `≥ ${filters.minCapacity} kWh` },
    filters.maxCapacity != null && { key: "maxCap", label: `≤ ${filters.maxCapacity} kWh` },
    filters.minPrice != null && { key: "minPrijs", label: `≥ € ${filters.minPrice}` },
    filters.maxPrice != null && { key: "maxPrijs", label: `≤ € ${filters.maxPrice}` },
    filters.expandableOnly && { key: "uitbreidbaar", label: "Uitbreidbaar" },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <main id="main-content">
      <div className="border-border/70 from-primary/5 border-b bg-gradient-to-b to-transparent">
        <Container className="py-10 sm:py-14">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">Catalogus</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Alle stekkerbatterijen
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
            Onafhankelijk vergelijken op prijs, capaciteit, vermogen en garantie, met echte reviews
            en actuele prijzen.
          </p>
        </Container>
      </div>

      <Container className="py-8">
        <div className="grid gap-8 md:grid-cols-[17rem_1fr]">
          <ProductFiltersDrawer brands={brands} categories={categories} filters={filters} />

          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-muted-foreground text-sm" aria-live="polite">
                <span className="text-foreground font-semibold">{total}</span>{" "}
                {total === 1 ? "resultaat" : "resultaten"}
              </p>
              <SortSelect current={filters.sort ?? "relevance"} />
            </div>

            {activeChips.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <Link
                    key={chip.key}
                    href={removeHref(chip.key)}
                    className="border-border bg-card hover:bg-accent inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors"
                  >
                    {chip.label}
                    <X className="size-3.5" />
                  </Link>
                ))}
                <Link
                  href="/batterijen"
                  className="text-muted-foreground hover:text-foreground ml-1 text-sm"
                >
                  Alles wissen
                </Link>
              </div>
            )}

            {items.length > 0 ? (
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((product) => (
                  <li key={product.id}>
                    <ProductCard product={product} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="border-border rounded-2xl border border-dashed p-12 text-center">
                <p className="text-lg font-semibold">Geen batterijen gevonden</p>
                <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
                  Pas je filters aan of bekijk het volledige aanbod van alle modellen.
                </p>
                <Link
                  href="/batterijen"
                  className={cn(buttonVariants({ variant: "outline" }), "mt-5")}
                >
                  Alle batterijen
                </Link>
              </div>
            )}

            {totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Paginering">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={pageHref(p)}
                    aria-current={p === page ? "page" : undefined}
                    className={cn(
                      buttonVariants({ variant: p === page ? "primary" : "outline", size: "icon" }),
                    )}
                  >
                    {p}
                  </Link>
                ))}
              </nav>
            )}
          </section>
        </div>
        <AffiliateDisclosure className="mt-8" />
      </Container>
    </main>
  );
}
