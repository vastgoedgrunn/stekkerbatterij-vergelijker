import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getArticleBySlug, getArticleSlugs } from "@/features/content/queries";
import { getGuideCoverUrl } from "@/features/content/covers";
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

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    alternates: { canonical: `/gidsen/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt ?? undefined,
      url: `${siteConfig.url}/gidsen/${article.slug}`,
    },
  };
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const cover = getGuideCoverUrl(article);

  return (
    <main id="main-content">
      <JsonLd
        data={[
          articleJsonLd(article),
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
          <div className="border-border/70 relative aspect-[16/9] overflow-hidden rounded-2xl border shadow-[var(--shadow-md)]">
            <Image
              src={cover}
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
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

        <div className="border-border mt-12 flex flex-col items-start gap-4 rounded-2xl border border-dashed p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Klaar om te kiezen?</p>
            <p className="text-muted-foreground text-sm">
              Gebruik de beslishulp voor een persoonlijk advies.
            </p>
          </div>
          <Link href="/beslishulp" className={cn(buttonVariants(), "shrink-0")}>
            Start de beslishulp <ArrowRight className="size-4" />
          </Link>
        </div>
      </Container>
    </main>
  );
}
