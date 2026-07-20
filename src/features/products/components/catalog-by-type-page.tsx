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
import type { ProductType } from "@/features/products/types";
import { catalogBasePath } from "@/features/products/product-paths";
import { businessRules } from "@/config/business-rules";
import { TrackView } from "@/lib/observability/track-view";

export function catalogMetadata(productType: Exclude<ProductType, "accessory">): Metadata {
  const base = catalogBasePath(productType);
  if (productType === "fixed") {
    return {
      title: "Vaste thuisbatterijen vergelijken",
      description:
        "Vergelijk vaste thuisbatterijen op capaciteit, vermogen en garantie. Vraag vrijblijvend een offerte aan via onze installatiepartner.",
      alternates: { canonical: base },
    };
  }
  return {
    title: "Alle stekkerbatterijen vergelijken",
    description:
      "Vergelijk alle plug-and-play stekkerbatterijen op prijs, capaciteit, vermogen en garantie. Onafhankelijk en actueel.",
    alternates: { canonical: base },
  };
}

export async function CatalogByTypePage({
  productType,
  searchParams,
}: {
  productType: Exclude<ProductType, "accessory">;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = { ...parseProductFilters(params), productType };
  const basePath = catalogBasePath(productType);
  const isFixed = productType === "fixed";

  const [{ items, total, page, pageSize }, brands, allCategories] = await Promise.all([
    getProducts(filters),
    getBrands({ productType }),
    getCategories(),
  ]);

  // Categorieën die tot het andere producttype horen, niet tonen in deze catalogus.
  const categories = allCategories.filter((c) =>
    isFixed ? c.slug !== "balkonbatterijen" : c.slug !== "vaste-thuisbatterijen",
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const stringParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") stringParams[key] = value;
  }

  const pageHref = (targetPage: number) => ({
    pathname: basePath,
    query: { ...stringParams, pagina: String(targetPage) },
  });

  const removeHref = (key: string) => {
    const query = { ...stringParams };
    delete query[key];
    return { pathname: basePath, query };
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
      {isFixed && <TrackView event={{ name: "fixed_catalog_viewed", props: { path: basePath } }} />}
      <div className="border-border/70 from-primary/5 border-b bg-gradient-to-b to-transparent">
        <Container className="py-10 sm:py-14">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">Catalogus</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {isFixed ? "Vaste thuisbatterijen" : "Stekkerbatterijen"}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
            {isFixed
              ? "Vergelijk geïnstalleerde systemen op specs en vraag vrijblijvend een offerte aan. Geen misleidende webshopprijzen."
              : "Onafhankelijk vergelijken op prijs, capaciteit, vermogen en garantie, met externe marktscores en prijzen inclusief controledatum."}
          </p>
          <p className="mt-4">
            <Link
              href={isFixed ? "/stekkerbatterijen" : "/vaste-thuisbatterijen"}
              className="text-primary text-sm font-semibold hover:underline"
            >
              {isFixed
                ? "Liever plug-and-play? Bekijk stekkerbatterijen"
                : "Meer capaciteit nodig? Bekijk vaste thuisbatterijen"}
            </Link>
          </p>
        </Container>
      </div>

      <Container className="py-8">
        <div className="grid gap-8 md:grid-cols-[17rem_1fr]">
          <ProductFiltersDrawer
            brands={brands}
            categories={categories}
            filters={filters}
            action={basePath}
          />

          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-muted-foreground text-sm" aria-live="polite">
                <span className="text-foreground font-semibold">{total}</span>{" "}
                {total === 1 ? "resultaat" : "resultaten"}
              </p>
              <SortSelect
                current={
                  filters.sort ??
                  (isFixed
                    ? businessRules.catalog.defaultFixedSort
                    : businessRules.catalog.defaultPlugInSort)
                }
              />
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
                  href={basePath}
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
                  Pas je filters aan of bekijk het volledige aanbod.
                </p>
                <Link
                  href={basePath}
                  className={cn(buttonVariants({ variant: "outline" }), "mt-5")}
                >
                  Alle resultaten
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
        {!isFixed && <AffiliateDisclosure className="mt-8" />}
      </Container>
    </main>
  );
}
