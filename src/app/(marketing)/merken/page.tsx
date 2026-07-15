import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, Factory } from "lucide-react";
import { getBrands } from "@/features/products/queries";
import { Container, Section, SectionHeading } from "@/components/patterns/section";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

const title = "Stekkerbatterij-merken vergelijken";
const description =
  "Ontdek alle merken plug-and-play stekkerbatterijen op één plek. Vergelijk het aanbod per merk op capaciteit, vermogen, garantie en prijs.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/merken" },
  openGraph: {
    title,
    description,
    type: "website",
    url: `${siteConfig.url}/merken`,
  },
};

export default async function BrandsHubPage() {
  const brands = await getBrands();

  return (
    <main>
      <div className="border-border/70 from-primary/5 border-b bg-gradient-to-b to-transparent">
        <Container className="py-10 sm:py-14">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">Merken</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Alle stekkerbatterij-merken
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
            Blader per fabrikant door het aanbod aan plug-and-play stekkerbatterijen. Kies een merk
            om alle beschikbare modellen te vergelijken op specificaties en prijs.
          </p>
        </Container>
      </div>

      <Container>
        <Section className="py-10 sm:py-14">
          <SectionHeading
            eyebrow="Overzicht"
            title="Kies een merk"
            description="Elk merk heeft een eigen overzichtspagina met alle modellen die wij vergelijken."
          />

          {brands.length === 0 ? (
            <p className="text-muted-foreground mt-8">Er zijn nog geen merken beschikbaar.</p>
          ) : (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {brands.map((brand) => (
                <li key={brand.id}>
                  <Card interactive className="group relative h-full">
                    <div className="flex h-full items-center justify-between gap-4 p-6">
                      <div className="flex items-center gap-3">
                        <span className="bg-muted text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
                          <Factory className="size-5" aria-hidden />
                        </span>
                        <div>
                          <h2 className="group-hover:text-primary leading-tight font-semibold transition-colors">
                            <Link
                              href={`/merken/${brand.slug}` as Route}
                              className="after:absolute after:inset-0"
                            >
                              {brand.name}
                            </Link>
                          </h2>
                          <p className="text-muted-foreground text-sm">Bekijk modellen</p>
                        </div>
                      </div>
                      <ArrowRight
                        className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </Container>
    </main>
  );
}
