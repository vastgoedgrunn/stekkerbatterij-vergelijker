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
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type { ProductDetail } from "@/features/products/types";

function parseSlugs(ids: string | string[] | undefined): string[] {
  const idParam = Array.isArray(ids) ? ids[0] : ids;
  return (idParam ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, businessRules.comparison.maxItems);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string | string[] }>;
}): Promise<Metadata> {
  const { ids } = await searchParams;
  const slugs = parseSlugs(ids);
  const products = (await Promise.all(slugs.map((slug) => getProductBySlug(slug)))).filter(
    (p): p is ProductDetail => p !== null,
  );

  if (products.length >= 2) {
    const names = products.map((p) => p.name).join(" vs ");
    const title = `${names}: vergelijken`;
    const description = `Vergelijk ${names} op capaciteit, vermogen, garantie en prijs. Deelbare specificatievergelijking.`;
    const canonical = `/vergelijken?ids=${products.map((p) => p.slug).join(",")}`;
    return {
      title,
      description,
      alternates: { canonical },
      robots: { index: true, follow: true },
      openGraph: {
        title,
        description,
        url: `${siteConfig.url}${canonical}`,
        type: "website",
      },
    };
  }

  return {
    title: "Stekkerbatterijen vergelijken",
    description:
      "Zet plug-and-play stekkerbatterijen naast elkaar en vergelijk specificaties en prijzen.",
    robots: { index: false, follow: true },
  };
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string | string[] }>;
}) {
  const { ids } = await searchParams;
  const slugs = parseSlugs(ids);

  const products = (await Promise.all(slugs.map((slug) => getProductBySlug(slug)))).filter(
    (p): p is ProductDetail => p !== null,
  );

  return (
    <main id="main-content">
      <div className="border-border/70 from-primary/5 border-b bg-gradient-to-b to-transparent">
        <Container className="py-10 sm:py-14">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">Vergelijken</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {products.length >= 2
              ? products.map((p) => p.name).join(" vs ")
              : "Batterijen naast elkaar"}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
            De beste waarde per kenmerk is gemarkeerd met een{" "}
            <span className="text-primary font-medium">trofee</span>. Deel deze URL om dezelfde
            vergelijking te openen.
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
            <Link href="/stekkerbatterijen" className={cn(buttonVariants(), "mt-5")}>
              Naar stekkerbatterijen
            </Link>
          </div>
        )}
      </Container>
    </main>
  );
}
