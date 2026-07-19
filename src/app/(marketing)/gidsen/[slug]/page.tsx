import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getArticleBySlug, getArticleSlugs } from "@/features/content/queries";
import { getGuideCoverUrl } from "@/features/content/covers";
import { GuideCover } from "@/features/content/guide-cover";
import { getRelatedGuides } from "@/features/content/related-guides";
import { getProducts } from "@/features/products/queries";
import { ProductCard } from "@/components/patterns/product-card";
import { AffiliateDisclosure } from "@/components/patterns/affiliate-disclosure";
import { Container } from "@/components/patterns/section";
import { buttonVariants } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Gids niet gevonden" };

  const cover = getGuideCoverUrl(article);
  const description = article.excerpt ?? undefined;

  return {
    title: article.title,
    description,
    alternates: { canonical: `/gidsen/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description,
      url: `${siteConfig.url}/gidsen/${article.slug}`,
      ...(cover ? { images: [{ url: cover, alt: article.title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      ...(cover ? { images: [cover] } : {}),
    },
  };
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, catalog] = await Promise.all([
    getArticleBySlug(slug),
    getProducts({ productType: "plug_in", sort: "value_asc", pageSize: 4 }),
  ]);
  if (!article) notFound();

  const cover = getGuideCoverUrl(article);
  const featured = catalog.items.filter((p) => p.bestOffer?.affiliateUrl).slice(0, 3);
  const relatedGuides = getRelatedGuides(article.slug);

  return (
    <main id="main-content">
      <JsonLd
        data={[
          articleJsonLd({
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            publishedAt: article.publishedAt,
            updatedAt: article.updatedAt ?? null,
            imageUrl: cover,
          }),
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Gidsen", url: "/gidsen" },
            { name: article.title, url: `/gidsen/${article.slug}` },
          ]),
        ]}
      />

      <div className="border-border/70 from-primary/5 border-b bg-gradient-to-b to-transparent">
        <Container className="max-w-3xl! py-10 sm:py-12">
          <Link
            href="/gidsen"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="size-4" /> Alle gidsen
          </Link>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {article.title}
          </h1>
          {article.publishedAt && (
            <p className="text-muted-foreground mt-3 text-sm">
              Gepubliceerd op {formatDate(article.publishedAt)}
            </p>
          )}
        </Container>
      </div>

      {cover && (
        <Container className="max-w-3xl! pt-8">
          <GuideCover
            src={cover}
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="border-border/70 aspect-[16/9] rounded-2xl border shadow-[var(--shadow-md)]"
          />
        </Container>
      )}

      <Container className="max-w-3xl! py-12">
        <article className="space-y-6">
          {article.body.map((block, i) =>
            block.type === "heading" ? (
              <h2 key={i} className="mt-4 text-2xl font-bold tracking-tight">
                {block.text}
              </h2>
            ) : (
              <p key={i} className="text-muted-foreground text-lg leading-relaxed">
                {block.text}
              </p>
            ),
          )}
        </article>

        {featured.length > 0 && (
          <section className="mt-14" aria-labelledby="guide-products">
            <h2 id="guide-products" className="text-2xl font-bold tracking-tight">
              Scherpste stekkerbatterijen nu
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Direct door naar de aanbieder, of bekijk eerst de specs.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <AffiliateDisclosure className="mt-4" />
          </section>
        )}

        <section className="mt-14" aria-labelledby="related-guides">
          <h2 id="related-guides" className="text-2xl font-bold tracking-tight">
            Gerelateerde gidsen
          </h2>
          <ul className="mt-4 space-y-2">
            {relatedGuides.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/gidsen/${guide.slug}` as Route}
                  className="text-primary inline-flex items-center gap-1 font-semibold hover:underline"
                >
                  {guide.title} <ArrowRight className="size-4" />
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={"/beste-stekkerbatterij" as Route}
                className="text-primary inline-flex items-center gap-1 font-semibold hover:underline"
              >
                Beste stekkerbatterij 2026 <ArrowRight className="size-4" />
              </Link>
            </li>
            <li>
              <Link
                href={"/stekkerbatterijen" as Route}
                className="text-primary inline-flex items-center gap-1 font-semibold hover:underline"
              >
                Stekkerbatterijen vergelijken <ArrowRight className="size-4" />
              </Link>
            </li>
          </ul>
        </section>

        <div className="border-border mt-12 flex flex-col items-start gap-4 rounded-2xl border border-dashed p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Klaar om te kiezen?</p>
            <p className="text-muted-foreground text-sm">
              Gebruik de beslishulp, of ga direct naar de catalogus.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link href="/beslishulp" className={cn(buttonVariants(), "shrink-0")}>
              Start de beslishulp <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/stekkerbatterijen"
              className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
            >
              Bekijk stekkerbatterijen
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
