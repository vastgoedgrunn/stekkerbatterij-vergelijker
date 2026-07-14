import Link from "next/link";
import { ArrowRight, Scale, ShieldCheck, Sparkles, TrendingDown } from "lucide-react";
import { getProducts } from "@/features/products/queries";
import { getArticles } from "@/features/content/queries";
import { ProductCard } from "@/components/patterns/product-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

const trustItems = [
  {
    icon: Scale,
    title: "Onafhankelijk",
    text: "Objectieve rangschikking op prijs, capaciteit en garantie.",
  },
  {
    icon: TrendingDown,
    title: "Actuele prijzen",
    text: "Prijshistorie en laagste prijs van 30 dagen.",
  },
  { icon: ShieldCheck, title: "Betrouwbaar", text: "Transparant over aanbieders en advertenties." },
];

export default async function HomePage() {
  const [{ items: featured }, articles] = await Promise.all([
    getProducts({ sort: "rating_desc", pageSize: 3 }),
    getArticles(),
  ]);

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />

      <section className="border-border from-primary/5 to-background border-b bg-gradient-to-b">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center">
          <span className="bg-accent text-accent-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium">
            <Sparkles className="size-4" /> Onafhankelijk platform
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Vind de beste stekkerbatterij voor jouw situatie
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg text-pretty">
            Vergelijk plug-and-play thuisbatterijen op prijs, capaciteit, vermogen en garantie.
            Onafhankelijk, actueel en compleet.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/beslishulp" className={cn(buttonVariants({ size: "lg" }))}>
              Start de beslishulp <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/batterijen"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Bekijk alle batterijen
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="border-border flex items-start gap-3 rounded-xl border p-4"
            >
              <item.icon className="text-primary mt-0.5 size-5 shrink-0" aria-hidden />
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-muted-foreground text-sm">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-8">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Populaire batterijen</h2>
            <Link href="/batterijen" className="text-primary text-sm font-medium hover:underline">
              Alles bekijken
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {articles.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-8">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Uit onze kennisbank</h2>
            <Link href="/gidsen" className="text-primary text-sm font-medium hover:underline">
              Alle gidsen
            </Link>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2">
            {articles.slice(0, 2).map((article) => (
              <li key={article.id}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
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
                      Lees meer <ArrowRight className="size-4" />
                    </Link>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="bg-primary text-primary-foreground flex flex-col items-center gap-4 rounded-2xl px-6 py-12 text-center">
          <h2 className="text-2xl font-bold">Niet zeker welke batterij past?</h2>
          <p className="max-w-md opacity-90">
            Onze beslishulp geeft je in vier stappen een persoonlijk advies.
          </p>
          <Link
            href="/beslishulp"
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
          >
            Start de beslishulp <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
