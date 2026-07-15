import type { Metadata } from "next";
import Link from "next/link";
import { getProductBySlug } from "@/features/products/queries";
import { CompareView } from "@/features/comparison/compare-view";
import { EnergyUpsellStrip } from "@/components/patterns/energy-upsell-strip";
import { AffiliateDisclosure } from "@/components/patterns/affiliate-disclosure";
import { TrackView } from "@/lib/observability/track-view";
import { Container } from "@/components/patterns/section";
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
    <main id="main-content">
      <div className="border-border/70 from-primary/5 border-b bg-gradient-to-b to-transparent">
        <Container className="py-10 sm:py-14">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">Vergelijken</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Batterijen naast elkaar
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
            De beste waarde per kenmerk is gemarkeerd met een{" "}
            <span className="text-primary font-medium">trofee</span>.
          </p>
        </Container>
      </div>

      <Container className="py-8">
        {products.length >= 2 ? (
          <>
            <TrackView event={{ name: "comparison_started", props: { count: products.length } }} />
            <CompareView products={products} />
            <EnergyUpsellStrip className="mt-10" />
            <AffiliateDisclosure className="mt-6" />
          </>
        ) : (
          <div className="border-border rounded-2xl border border-dashed p-12 text-center">
            <p className="text-lg font-semibold">Selecteer minimaal twee batterijen</p>
            <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
              Voeg batterijen toe via de vergelijk-knop in de catalogus of op een productpagina.
            </p>
            <Link href="/batterijen" className={cn(buttonVariants(), "mt-5")}>
              Naar de catalogus
            </Link>
          </div>
        )}
      </Container>
    </main>
  );
}
