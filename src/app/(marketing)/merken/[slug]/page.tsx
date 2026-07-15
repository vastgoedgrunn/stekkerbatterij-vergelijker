import type { Metadata } from "next";
import type { Route } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getBrands, getProducts } from "@/features/products/queries";
import { ProductCard } from "@/components/patterns/product-card";
import { Container } from "@/components/patterns/section";
import { buttonVariants } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/json-ld";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  const brands = await getBrands();
  return brands.map((brand) => ({ slug: brand.slug }));
}

async function getBrandBySlug(slug: string) {
  const brands = await getBrands();
  return brands.find((brand) => brand.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return { title: "Merk niet gevonden" };

  const title = `${brand.name} stekkerbatterijen vergelijken`;
  const description = `Vergelijk alle ${brand.name} plug-and-play stekkerbatterijen op capaciteit, vermogen, garantie en prijs. Vind onafhankelijk het beste ${brand.name}-model voor jouw situatie.`;

  return {
    title,
    description,
    alternates: { canonical: `/merken/${slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteConfig.url}/merken/${slug}`,
    },
  };
}

export default async function BrandDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [brand, result] = await Promise.all([
    getBrandBySlug(slug),
    getProducts({ brandSlug: slug, pageSize: 48 }),
  ]);

  if (!brand || result.items.length === 0) notFound();

  const products = result.items;

  const structuredData: Record<string, unknown>[] = [
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Merken", url: "/merken" },
      { name: brand.name, url: `/merken/${slug}` },
    ]),
    itemListJsonLd(
      products.map((product) => ({
        name: product.name,
        url: `/batterijen/${product.slug}`,
      })),
    ),
  ];

  return (
    <main>
      <JsonLd data={structuredData} />

      <Container className="py-8">
        <nav aria-label="Kruimelpad" className="text-muted-foreground mb-6 text-sm">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <ChevronRight className="size-4" aria-hidden />
            <li>
              <Link href="/merken" className="hover:text-foreground">
                Merken
              </Link>
            </li>
            <ChevronRight className="size-4" aria-hidden />
            <li className="text-foreground font-medium">{brand.name}</li>
          </ol>
        </nav>

        <header className="max-w-3xl">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">Merk</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {brand.name} stekkerbatterijen
          </h1>
          <div className="text-muted-foreground mt-4 space-y-3 leading-relaxed">
            <p>
              Op deze pagina vind je alle plug-and-play stekkerbatterijen van {brand.name} die wij
              vergelijken. Zo zie je in één oogopslag welke modellen dit merk voert en hoe ze zich
              tot elkaar verhouden.
            </p>
            <p>
              Vergelijk de {brand.name}-batterijen onderling op capaciteit (kWh), vermogen (kW),
              garantie en de actuele laagste prijs. Klik op een model voor de volledige
              specificaties en het complete prijsoverzicht van alle aanbieders.
            </p>
          </div>
        </header>

        <section aria-label={`Modellen van ${brand.name}`} className="mt-10">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>

        <section className="border-border bg-card mt-14 rounded-2xl border p-6 sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Twijfel je nog over het juiste model?
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Onze beslishulp helpt je in een paar stappen aan een passende stekkerbatterij. Of bekijk
            direct het volledige aanbod van alle merken naast elkaar.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href={"/beslishulp" as Route} className={cn(buttonVariants({ size: "lg" }))}>
              Start de beslishulp
            </Link>
            <Link
              href={"/batterijen" as Route}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Bekijk alle batterijen
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}
