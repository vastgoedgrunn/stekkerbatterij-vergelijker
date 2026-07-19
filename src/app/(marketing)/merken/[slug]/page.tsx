import type { Metadata } from "next";
import type { Route } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getBrands, getProducts } from "@/features/products/queries";
import { productDetailPath } from "@/features/products/product-paths";
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

  const { items } = await getProducts({ brandSlug: slug, pageSize: 48 });
  const hasPlugIn = items.some((p) => p.productType === "plug_in");
  const hasFixed = items.some((p) => p.productType === "fixed");

  const title =
    hasPlugIn && !hasFixed
      ? `${brand.name} stekkerbatterijen vergelijken`
      : hasFixed && !hasPlugIn
        ? `${brand.name} thuisbatterijen vergelijken`
        : `${brand.name} batterijen vergelijken`;

  const description =
    hasPlugIn && !hasFixed
      ? `Vergelijk ${brand.name} stekkerbatterijen op capaciteit, vermogen, garantie en prijs. Onafhankelijk overzicht van modellen en aanbieders.`
      : `Vergelijk ${brand.name} thuisbatterijen op capaciteit, vermogen en garantie. Onafhankelijk overzicht van modellen.`;

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
  const hasPlugIn = products.some((p) => p.productType === "plug_in");
  const hasFixed = products.some((p) => p.productType === "fixed");
  const heading =
    hasPlugIn && !hasFixed
      ? `${brand.name} stekkerbatterijen`
      : hasFixed && !hasPlugIn
        ? `${brand.name} thuisbatterijen`
        : `${brand.name} batterijen`;

  const structuredData: Record<string, unknown>[] = [
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Merken", url: "/merken" },
      { name: brand.name, url: `/merken/${slug}` },
    ]),
    itemListJsonLd(
      products.map((product) => ({
        name: product.name,
        url: productDetailPath(product.slug, product.productType),
      })),
    ),
  ];

  return (
    <main id="main-content">
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
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h1>
          <div className="text-muted-foreground mt-4 space-y-3 leading-relaxed">
            <p>
              Op deze pagina zie je de {brand.name}-modellen die wij vergelijken. Zo beoordeel je in
              één oogopslag capaciteit, vermogen en garantie, en ga je door naar de productpagina
              voor aanbieders.
            </p>
            <p>
              Twijfel je tussen merken? Bekijk ook onze{" "}
              <Link
                href="/beste-stekkerbatterij"
                className="text-primary font-medium hover:underline"
              >
                beste stekkerbatterijen
              </Link>
              , de{" "}
              <Link
                href="/gidsen/stekkerbatterij-koopgids"
                className="text-primary font-medium hover:underline"
              >
                koopgids
              </Link>{" "}
              of het volledige overzicht op{" "}
              <Link href="/stekkerbatterijen" className="text-primary font-medium hover:underline">
                stekkerbatterijen vergelijken
              </Link>
              .
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
            Onze beslishulp helpt je in een paar stappen. Of bekijk het volledige aanbod van alle
            merken naast elkaar.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href={"/beslishulp" as Route} className={cn(buttonVariants({ size: "lg" }))}>
              Start de beslishulp
            </Link>
            <Link
              href={"/stekkerbatterijen" as Route}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Vergelijk stekkerbatterijen
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}
