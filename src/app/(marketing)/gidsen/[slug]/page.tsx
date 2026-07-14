import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleBySlug, getArticleSlugs } from "@/features/content/queries";
import { JsonLd } from "@/components/seo/json-ld";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { formatDate } from "@/lib/format";
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

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
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

      <article className="prose-headings:font-bold">
        <Link href="/gidsen" className="text-muted-foreground text-sm hover:underline">
          ← Alle gidsen
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance">{article.title}</h1>
        {article.publishedAt && (
          <p className="text-muted-foreground mt-2 text-sm">
            Gepubliceerd op {formatDate(article.publishedAt)}
          </p>
        )}

        <div className="mt-8 space-y-5">
          {article.body.map((block, i) =>
            block.type === "heading" ? (
              <h2 key={i} className="text-xl font-semibold">
                {block.text}
              </h2>
            ) : (
              <p key={i} className="text-muted-foreground leading-relaxed">
                {block.text}
              </p>
            ),
          )}
        </div>
      </article>
    </main>
  );
}
