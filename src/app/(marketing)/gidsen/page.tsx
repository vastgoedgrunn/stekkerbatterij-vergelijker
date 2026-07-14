import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getArticles } from "@/features/content/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Koopgidsen & kennis over stekkerbatterijen",
  description:
    "Onafhankelijke gidsen over stekkerbatterijen: capaciteit, veiligheid, saldering en terugverdientijd.",
  alternates: { canonical: "/gidsen" },
};

export default async function GuidesPage() {
  const articles = await getArticles();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Gidsen & kennis</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Onafhankelijke uitleg om de juiste keuze te maken — van capaciteit en veiligheid tot de
          afbouw van de salderingsregeling.
        </p>
      </header>

      {articles.length > 0 ? (
        <ul className="grid gap-6 sm:grid-cols-2">
          {articles.map((article) => (
            <li key={article.id}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  {article.publishedAt && (
                    <p className="text-muted-foreground text-xs">
                      {formatDate(article.publishedAt)}
                    </p>
                  )}
                  <CardTitle>
                    <Link href={`/gidsen/${article.slug}`} className="hover:underline">
                      {article.title}
                    </Link>
                  </CardTitle>
                  {article.excerpt && <CardDescription>{article.excerpt}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/gidsen/${article.slug}`}
                    className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
                  >
                    Lees de gids <ArrowRight className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">Er zijn nog geen gidsen gepubliceerd.</p>
      )}
    </main>
  );
}
