import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BatteryCharging,
  LineChart,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { getProducts } from "@/features/products/queries";
import { getArticles } from "@/features/content/queries";
import { getGuideCoverUrl } from "@/features/content/covers";
import { ProductCard } from "@/components/patterns/product-card";
import { HeroMatcher } from "@/features/comparison/hero-matcher";
import { Container, Section, SectionHeading } from "@/components/patterns/section";
import { Reveal } from "@/components/patterns/reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

const brands = [
  "Zendure",
  "EcoFlow",
  "Anker SOLIX",
  "Marstek",
  "Growatt",
  "Sessy",
  "HomeWizard",
  "Sunology",
];

const trustItems = [
  {
    icon: Scale,
    title: "100% onafhankelijk",
    text: "We rangschikken objectief op prijs, capaciteit, garantie en reviews, niet op wie het meest betaalt.",
  },
  {
    icon: TrendingDown,
    title: "Altijd actuele prijzen",
    text: "Dagelijks bijgewerkte prijzen met volledige prijshistorie en de laagste prijs van 30 dagen.",
  },
  {
    icon: ShieldCheck,
    title: "Transparant & compleet",
    text: "Alle specs, meerdere aanbieders per model en eerlijke uitleg over sponsoring.",
  },
];

const steps = [
  {
    icon: Search,
    title: "Vertel je situatie",
    text: "Verbruik, zonnepanelen en wensen, in een paar tikken.",
  },
  {
    icon: Sparkles,
    title: "Krijg een persoonlijke match",
    text: "Onze transparante beslishulp rangschikt de beste batterijen voor jou.",
  },
  {
    icon: BadgeCheck,
    title: "Vergelijk en kies",
    text: "Bekijk specs naast elkaar en ga naar de aanbieder met de beste prijs.",
  },
];

export default async function HomePage() {
  const [{ items: featured }, articles] = await Promise.all([
    getProducts({ sort: "rating_desc", pageSize: 8 }),
    getArticles(),
  ]);

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />

      {/* HERO */}
      <section className="border-border/70 relative overflow-hidden border-b">
        <div aria-hidden className="ambient-glow pointer-events-none absolute inset-0" />
        <Container className="relative grid grid-cols-1 items-center gap-12 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="flex min-w-0 flex-col gap-6">
            <span className="text-muted-foreground inline-flex w-fit items-center gap-2 text-sm font-semibold tracking-wide uppercase">
              <Scale className="text-primary size-4" />
              Onafhankelijk vergelijkingsplatform
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Vind de <span className="text-primary">beste stekkerbatterij</span> voor jouw huis
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg text-pretty">
              Vergelijk plug-and-play thuisbatterijen op prijs, capaciteit, vermogen en garantie.
              Onafhankelijk, actueel en compleet, zodat jij met vertrouwen kiest.
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

          <div className="relative min-w-0 lg:pl-4">
            <div
              aria-hidden
              className="animate-float pointer-events-none absolute -top-14 -right-3 hidden w-44 lg:block xl:-right-6 xl:w-52"
            >
              <Image
                src="/images/hero-product.png"
                alt=""
                width={512}
                height={512}
                priority
                sizes="(max-width: 1280px) 176px, 208px"
                className="h-auto w-full drop-shadow-2xl"
              />
            </div>
            <div className="relative z-10">
              <HeroMatcher products={featured} />
            </div>
          </div>
        </Container>
      </section>

      {/* MERKEN */}
      <div className="border-border/70 border-y py-8">
        <Container>
          <p className="text-muted-foreground mb-5 text-center text-xs font-semibold tracking-[0.2em] uppercase">
            Alle grote merken op één plek
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {brands.map((brand) => (
              <span
                key={brand}
                className="border-border/70 bg-card text-muted-foreground hover:text-foreground rounded-full border px-4 py-1.5 text-sm font-semibold tracking-tight shadow-[var(--shadow-xs)] transition-colors"
              >
                {brand}
              </span>
            ))}
          </div>
        </Container>
      </div>

      {/* TRUST */}
      <Section>
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {trustItems.map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <Card className="h-full p-6">
                  <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
                    <item.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                    {item.text}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* UITGELICHT */}
      {featured.length > 0 && (
        <Section tinted>
          <Container>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Best beoordeeld"
                title="Populaire stekkerbatterijen"
                description="De hoogst gewaardeerde modellen van dit moment, op basis van echte reviews."
              />
              <Link
                href="/batterijen"
                className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
              >
                Alles bekijken <ArrowRight className="size-4" />
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.slice(0, 4).map((product, i) => (
                <Reveal as="li" key={product.id} delay={i * 60}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      {/* HOE WERKT HET */}
      <Section className="bg-muted/40 border-border/70 border-y">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <div className="border-border/70 relative aspect-[4/3] overflow-hidden rounded-3xl border shadow-[var(--shadow-lg)]">
                <Image
                  src="/images/hero-home.png"
                  alt="Stekkerbatterij aan de muur in een moderne bijkeuken"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <div>
              <SectionHeading
                eyebrow="Zo werkt het"
                title="In drie stappen naar de juiste batterij"
                description="Geen technisch jargon. Wij vertalen jouw situatie naar een helder, eerlijk advies."
              />
              <ol className="mt-8 space-y-6">
                {steps.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-xl font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="flex items-center gap-2 font-semibold">
                        <step.icon className="text-primary size-4" /> {step.title}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link href="/beslishulp" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
                Start de beslishulp <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* KENNISBANK */}
      {articles.length > 0 && (
        <Section>
          <Container>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Kennisbank"
                title="Word wegwijs in energieopslag"
                description="Onafhankelijke koopgidsen en uitleg, geschreven om je écht verder te helpen."
              />
              <Link
                href="/gidsen"
                className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
              >
                Alle gidsen <ArrowRight className="size-4" />
              </Link>
            </div>
            <ul className="grid gap-6 md:grid-cols-3">
              {articles.slice(0, 3).map((article, i) => {
                const cover = getGuideCoverUrl(article);
                return (
                  <Reveal as="li" key={article.id} delay={i * 60}>
                    <Card interactive className="group h-full overflow-hidden">
                      <div className="bg-muted relative aspect-[16/10] overflow-hidden">
                        {cover ? (
                          <Image
                            src={cover}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <span className="text-primary/25 flex h-full items-center justify-center">
                            <LineChart className="size-12" aria-hidden />
                          </span>
                        )}
                      </div>
                      <CardContent className="flex flex-col gap-3 p-6">
                        <Badge variant="muted" className="w-fit">
                          <LineChart className="size-3" /> Gids
                        </Badge>
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
                          Lees meer <ArrowRight className="size-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </Reveal>
                );
              })}
            </ul>
          </Container>
        </Section>
      )}

      {/* CTA */}
      <Section className="pt-0">
        <Container>
          <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-3xl px-6 py-14 text-center shadow-[var(--shadow-xl)] sm:px-12">
            <BatteryCharging className="absolute -top-8 -right-8 size-48 opacity-10" />
            <div className="relative mx-auto flex max-w-xl flex-col items-center gap-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Niet zeker welke batterij past?
              </h2>
              <p className="text-lg opacity-90">
                Onze beslishulp geeft je in vijf korte stappen een persoonlijk, onafhankelijk
                advies.
              </p>
              <Link
                href="/beslishulp"
                className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "mt-2")}
              >
                Start de beslishulp <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
