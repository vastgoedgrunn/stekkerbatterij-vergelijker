import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { getArticles } from "@/features/content/queries";
import { Container } from "@/components/patterns/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const [featured, ...rest] = articles;

  return (
    <main>
      <div className="border-border/70 from-primary/5 border-b bg-gradient-to-b to-transparent">
        <Container className="py-10 sm:py-14">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">Kennisbank</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Gidsen &amp; kennis
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
            Onafhankelijke uitleg om de juiste keuze te maken — van capaciteit en veiligheid tot de
            afbouw van de salderingsregeling.
          </p>
        </Container>
      </div>

      <Container className="py-10">
        {articles.length === 0 ? (
          <p className="text-muted-foreground">Er zijn nog geen gidsen gepubliceerd.</p>
        ) : (
          <div className="space-y-10">
            {featured && (
              <Link href={`/gidsen/${featured.slug}`} className="group block">
                <Card
                  interactive
                  className="from-primary/5 grid gap-6 overflow-hidden bg-gradient-to-br to-transparent p-6 sm:p-8 md:grid-cols-2 md:items-center"
                >
                  <div className="from-primary/20 to-primary/5 flex aspect-[16/10] items-center justify-center rounded-2xl bg-gradient-to-br">
                    <BookOpen className="text-primary/50 size-16" />
                  </div>
                  <div>
                    <Badge variant="highlight" className="mb-3">
                      Uitgelicht
                    </Badge>
                    <h2 className="group-hover:text-primary text-2xl font-bold tracking-tight">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="text-muted-foreground mt-2 leading-relaxed">
                        {featured.excerpt}
                      </p>
                    )}
                    <span className="text-primary mt-4 inline-flex items-center gap-1 font-semibold">
                      Lees de gids <ArrowRight className="size-4" />
                    </span>
                  </div>
                </Card>
              </Link>
            )}

            {rest.length > 0 && (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((article) => (
                  <li key={article.id}>
                    <Card interactive className="group h-full">
                      <CardContent className="flex h-full flex-col gap-3 p-6">
                        <Badge variant="muted" className="w-fit">
                          <BookOpen className="size-3" /> Gids
                        </Badge>
                        {article.publishedAt && (
                          <p className="text-muted-foreground text-xs">
                            {formatDate(article.publishedAt)}
                          </p>
                        )}
                        <h3 className="group-hover:text-primary text-lg leading-tight font-semibold">
                          <Link
                            href={`/gidsen/${article.slug}`}
                            className="after:absolute after:inset-0"
                          >
                            {article.title}
                          </Link>
                        </h3>
                        {article.excerpt && (
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {article.excerpt}
                          </p>
                        )}
                        <span className="text-primary mt-auto inline-flex items-center gap-1 text-sm font-semibold">
                          Lees de gids <ArrowRight className="size-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Container>
    </main>
  );
}
