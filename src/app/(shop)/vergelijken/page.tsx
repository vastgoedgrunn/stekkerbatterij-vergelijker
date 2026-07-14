import type { Metadata } from "next";
import Link from "next/link";
import { getProductBySlug } from "@/features/products/queries";
import { CompareView } from "@/features/comparison/compare-view";
import { buttonVariants } from "@/components/ui/button";
import { businessRules } from "@/config/business-rules";
import { cn } from "@/lib/utils";
import type { ProductDetail } from "@/features/products/types";

export const metadata: Metadata = {
  title: "Stekkerbatterijen vergelijken",
  description:
    "Zet plug-and-play stekkerbatterijen naast elkaar en vergelijk specificaties en prijzen.",
  robots: { index: false, follow: true },
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string | string[] }>;
}) {
  const { ids } = await searchParams;
  const idParam = Array.isArray(ids) ? ids[0] : ids;
  const slugs = (idParam ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, businessRules.comparison.maxItems);

  const products = (await Promise.all(slugs.map((slug) => getProductBySlug(slug)))).filter(
    (p): p is ProductDetail => p !== null,
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Vergelijken</h1>
        <p className="text-muted-foreground mt-1">
          De beste waarde per kenmerk is groen gemarkeerd.
        </p>
      </header>

      {products.length >= 2 ? (
        <CompareView products={products} />
      ) : (
        <div className="border-border rounded-xl border border-dashed p-12 text-center">
          <p className="font-medium">Selecteer minimaal twee batterijen</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Voeg batterijen toe via de vergelijk-knop in de catalogus.
          </p>
          <Link href="/batterijen" className={cn(buttonVariants(), "mt-4")}>
            Naar de catalogus
          </Link>
        </div>
      )}
    </main>
  );
}
