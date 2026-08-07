import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BatteryCharging,
  LineChart,
  PlugZap,
  Scale,
  ShieldCheck,
  TrendingDown,
  Wrench,
} from "lucide-react";
import { getProducts } from "@/features/products/queries";
import { getArticles } from "@/features/content/queries";
import { getGuideCoverUrl } from "@/features/content/covers";
import { GuideCover } from "@/features/content/guide-cover";
import { ProductCard } from "@/components/patterns/product-card";
import { AffiliateDisclosure } from "@/components/patterns/affiliate-disclosure";
import { HeroMatcher } from "@/features/comparison/hero-matcher";
import { HeroCta } from "@/features/experiments/hero-cta";
import { Container, Section, SectionHeading } from "@/components/patterns/section";
import { Reveal } from "@/components/patterns/reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { siteConfig } from "@/config/site";
import { businessRules } from "@/config/business-rules";
import { EDITORS_FAVORITE_PLUG_IN_SLUG } from "@/config/editors-picks";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: {
    absolute: siteConfig.titleDefault,
  },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: siteConfig.titleDefault,
    description: siteConfig.description,
    url: siteConfig.url,
    type: "website",
    siteName: siteConfig.name,
  },
};

/** Witte merklogo's (transparante PNG). Bestandsnaam = slug; later 1-op-1 vervangbaar. */
const brands = [
  { name: "Zendure", slug: "zendure", width: 327, height: 64 },
  { name: "EcoFlow", slug: "ecoflow", width: 375, height: 64 },
  { name: "Anker SOLIX", slug: "anker-solix", width: 468, height: 64 },
  { name: "Marstek", slug: "marstek", width: 360, height: 64 },
  { name: "Growatt", slug: "growatt", width: 295, height: 64 },
  { name: "Sessy", slug: "sessy", width: 180, height: 64 },
  { name: "HomeWizard", slug: "homewizard", width: 480, height: 64 },
  { name: "Sunology", slug: "sunology", width: 279, height: 64 },
] as const;
// Houd gelijk aan src/config/marquee-brands.ts (completeness-check).

const trustItems = [
  {
    icon: Scale,
    title: "100% onafhankelijk",
    text: "We rangschikken objectief op prijs, capaciteit, garantie en scores, niet op wie het meest betaalt.",
  },
  {
    icon: TrendingDown,
    title: "Prijzen met controledatum",
    text: "Elke prijs toont wanneer we die gecontroleerd hebben. Verse checks gaan voor oudere deals.",
  },
  {
    icon: ShieldCheck,
    title: "Transparant over aanbieders",
    text: "Je ziet bij welk merk of webshop de laagste prijs staat, met een duidelijke controledatum.",
  },
];

const steps = [
  {
    title: "Vertel je situatie",
    text: "Verbruik, zonnepanelen en wensen, in een paar tikken.",
  },
  {
    title: "Krijg een persoonlijke match",
    text: "Onze transparante beslishulp rangschikt de beste batterijen voor jou.",
  },
  {
    title: "Kies je pad: direct kopen of offerte voor installatie",
    text: "Stekkerbatterijen koop je online. Vaste systemen regel je via een vrijblijvende offerte.",
  },
];

export default async function HomePage() {
  const [{ items: plugInAll }, { items: fixedCandidates }, articles] = await Promise.all([
    getProducts({ productType: "plug_in", sort: "value_asc", pageSize: 24 }),
    getProducts({ productType: "fixed", sort: "capacity_desc", pageSize: 12 }),
    getArticles(),
  ]);

  const pricedPlugIns = plugInAll.filter((p) => p.lowestPriceCents !== null);
  const editorsPick = pricedPlugIns.find((p) => p.slug === EDITORS_FAVORITE_PLUG_IN_SLUG);
  const plugInFeatured = [
    ...(editorsPick ? [editorsPick] : []),
    ...pricedPlugIns.filter((p) => p.slug !== EDITORS_FAVORITE_PLUG_IN_SLUG),
  ].slice(0, 4);
  const fixedFeatured = fixedCandidates
    .filter(
      (p) =>
        !p.marketScore || p.marketScore.average >= businessRules.catalog.minFeaturedMarketScore,
    )
    .slice(0, 4);

  return (
    <main id="main-content">
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />

      {/* HERO */}
      <section className="border-border/70 relative overflow-hidden border-b">
        <div aria-hidden className="ambient-glow pointer-events-none absolute inset-0" />
        <Container className="relative grid grid-cols-1 items-center gap-12 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="flex min-w-0 flex-col gap-6">
            <span className="text-muted-foreground inline-flex w-fit items-center gap-2 text-sm font-semibold tracking-wide uppercase">
              Onafhankelijk vergelijkingsplatform
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Welke <span className="text-primary">thuisbatterij</span> past bij jou?
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg text-pretty">
              Vergelijk stekkerbatterijen en vaste thuisbatterijen op capaciteit, vermogen en
              garantie. Direct kopen of een offerte voor installatie: jij kiest het pad dat past.
            </p>
            <HeroCta />
          </div>

          <div className="min-w-0 lg:pl-4">
            <HeroMatcher products={plugInAll} />
          </div>
        </Container>
      </section>

      {/* KEUZEPADEN */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Kies je pad"
            title="Stekker of vaste installatie?"
            description="Twee manieren om energie op te slaan. Kies wat bij jouw huis en wensen past."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Reveal>
              <Link
                href="/stekkerbatterijen"
                className="border-border bg-card hover:border-primary/40 group flex h-full flex-col overflow-hidden rounded-3xl border shadow-[var(--shadow-sm)] transition-[border-color,box-shadow] hover:shadow-[var(--shadow-md)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src="/images/home/path-stekkerbatterij.png"
                    alt="Compacte stekkerbatterij aangesloten op een stopcontact in huis"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
                  />
                  <span className="bg-card/95 text-primary absolute bottom-4 left-4 flex size-11 items-center justify-center rounded-2xl shadow-[var(--shadow-sm)] backdrop-blur-sm">
                    <PlugZap className="size-5" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <h2 className="text-2xl font-bold tracking-tight">Stekkerbatterijen</h2>
                  <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
                    Plug-and-play, zonder installateur. Vergelijk prijzen bij webshops en ga direct
                    door naar de aanbieder.
                  </p>
                  <span className={cn(buttonVariants({ size: "sm" }), "mt-6 w-fit")}>
                    Bekijk stekkerbatterijen <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            </Reveal>

            <Reveal delay={80}>
              <Link
                href="/vaste-thuisbatterijen"
                className="border-border bg-card hover:border-primary/40 group flex h-full flex-col overflow-hidden rounded-3xl border shadow-[var(--shadow-sm)] transition-[border-color,box-shadow] hover:shadow-[var(--shadow-md)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src="/images/home/path-vaste-thuisbatterij.png"
                    alt="Wandgemonteerde vaste thuisbatterij in een moderne technische ruimte"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
                  />
                  <span className="bg-card/95 text-primary absolute bottom-4 left-4 flex size-11 items-center justify-center rounded-2xl shadow-[var(--shadow-sm)] backdrop-blur-sm">
                    <Wrench className="size-5" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <h2 className="text-2xl font-bold tracking-tight">Vaste thuisbatterijen</h2>
                  <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
                    Meer capaciteit met professionele installatie. Vergelijk topmodellen en vraag
                    een vrijblijvende offerte aan.
                  </p>
                  <span className={cn(buttonVariants({ size: "sm" }), "mt-6 w-fit")}>
                    Bekijk vaste systemen <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* MERKEN */}
      <div className="marquee-band py-10">
        <Container className="min-w-0">
          <p className="mb-6 text-center text-xs font-semibold tracking-[0.2em] text-white/55 uppercase">
            Alle grote merken op één plek
          </p>
          <div className="marquee">
            <div className="marquee-track">
              <div className="marquee-group">
                {brands.map((brand) => (
                  <span key={brand.slug} className="marquee-logo">
                    <Image
                      src={`/logos/brands/${brand.slug}.png`}
                      alt={brand.name}
                      width={brand.width}
                      height={brand.height}
                      sizes="160px"
                    />
                  </span>
                ))}
              </div>
              <div className="marquee-group" aria-hidden="true" data-marquee-clone>
                {brands.map((brand) => (
                  <span key={`clone-${brand.slug}`} className="marquee-logo">
                    <Image
                      src={`/logos/brands/${brand.slug}.png`}
                      alt=""
                      width={brand.width}
                      height={brand.height}
                      sizes="160px"
                    />
                  </span>
                ))}
              </div>
            </div>
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

      {/* UITGELICHT STEKKER */}
      {plugInFeatured.length > 0 && (
        <Section tinted>
          <Container>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Scherpste prijs per kWh"
                title="Onze favoriet en populaire stekkerbatterijen"
                description="De plug-and-play modellen met de laagste prijs per kWh opslag van dit moment."
              />
              <Link
                href="/stekkerbatterijen"
                className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
              >
                Alles bekijken <ArrowRight className="size-4" />
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {plugInFeatured.map((product, i) => (
                <Reveal as="li" key={product.id} delay={i * 60}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </ul>
            <AffiliateDisclosure className="mt-6" />
          </Container>
        </Section>
      )}

      {/* UITGELICHT VAST */}
      {fixedFeatured.length > 0 && (
        <Section>
          <Container>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Grote capaciteit"
                title="Vaste thuisbatterijen"
                description="Systemen met installatie. Vergelijk specs en vraag een vrijblijvende offerte aan."
              />
              <Link
                href="/vaste-thuisbatterijen"
                className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
              >
                Alles bekijken <ArrowRight className="size-4" />
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {fixedFeatured.map((product, i) => (
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
                      <h3 className="font-semibold">{step.title}</h3>
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
                      <GuideCover
                        src={cover}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="aspect-[16/10]"
                        imageClassName="transition-transform duration-300 group-hover:scale-[1.02]"
                      />
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
              <p className="text-lg">
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
    </main>
  );
}
