import type { Metadata } from "next";
import Link from "next/link";
import { getBrands, getCategories, getProducts } from "@/features/products/queries";
import { parseProductFilters } from "@/features/products/search-params";
import { ProductFilterPanel } from "@/features/products/components/product-filters";
import { SortSelect } from "@/features/products/components/sort-select";
import { ProductCard } from "@/components/patterns/product-card";
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

  const pageHref = (targetPage: number) => {
    const query: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "string") query[key] = value;
    }
    query.pagina = String(targetPage);
    return { pathname: "/batterijen" as const, query };
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Stekkerbatterijen</h1>
        <p className="text-muted-foreground mt-1">
          Onafhankelijk vergelijken op prijs, capaciteit, vermogen en garantie.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-[16rem_1fr]">
        <aside className="md:sticky md:top-20 md:self-start">
          <ProductFilterPanel brands={brands} categories={categories} filters={filters} />
        </aside>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm" aria-live="polite">
              {total} {total === 1 ? "resultaat" : "resultaten"}
            </p>
            <SortSelect current={filters.sort ?? "relevance"} />
          </div>

          {items.length > 0 ? (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="border-border rounded-xl border border-dashed p-12 text-center">
              <p className="font-medium">Geen batterijen gevonden</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Pas je filters aan of bekijk het volledige aanbod.
              </p>
              <Link
                href="/batterijen"
                className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
              >
                Alle batterijen
              </Link>
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Paginering">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={pageHref(p)}
                  aria-current={p === page ? "page" : undefined}
                  className={cn(
                    buttonVariants({ variant: p === page ? "primary" : "outline", size: "sm" }),
                  )}
                >
                  {p}
                </Link>
              ))}
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}
