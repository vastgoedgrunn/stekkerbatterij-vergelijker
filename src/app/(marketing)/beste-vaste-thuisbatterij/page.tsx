import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { BatteryCharging, ShieldCheck, Zap } from "lucide-react";
import { getProducts } from "@/features/products/queries";
import type { ProductListItem } from "@/features/products/types";
import { productDetailPath } from "@/features/products/product-paths";
import { ProductRatingDisplay } from "@/components/patterns/product-rating-display";
import { Container, Section, SectionHeading } from "@/components/patterns/section";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { itemListJsonLd } from "@/lib/seo/json-ld";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

const title = "Beste vaste thuisbatterij: onze topmodellen";
const description =
  "Onze onafhankelijke ranglijst van vaste thuisbatterijen, geordend op capaciteit. Vergelijk specs en vraag een vrijblijvende offerte aan. Geen verzonnen webshopprijzen.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/beste-vaste-thuisbatterij" },
  openGraph: {
    title,
    description,
    type: "website",
    url: `${siteConfig.url}/beste-vaste-thuisbatterij`,
  },
};

/** Bouwt een feitelijke, generieke reden op basis van échte productdata (geen verzonnen claims). */
function rankingReason(product: ProductListItem): string {
  const facts: string[] = [];
  if (product.capacityKwh !== null) {
    facts.push(`${formatNumber(product.capacityKwh)} kWh aan capaciteit`);
  }
  if (product.powerKw !== null) {
    facts.push(`${formatNumber(product.powerKw)} kW vermogen`);
  }
  if (product.warrantyYears !== null) {
    facts.push(`${product.warrantyYears} jaar garantie`);
  }

  const specSentence =
    facts.length > 0
      ? `De ${product.name} combineert ${facts.join(", ")}.`
      : `De ${product.name} van ${product.brand.name} valt op in ons overzicht.`;

  const ratingSentence =
    product.rating.average !== null && product.rating.count > 0
      ? `Gebruikers waarderen dit model met een gemiddelde van ${formatNumber(
          product.rating.average,
          {
            maximumFractionDigits: 1,
          },
        )} op basis van ${product.rating.count} ${product.rating.count === 1 ? "review" : "reviews"}.`
      : product.marketScore
        ? `Externe marktscore: ${formatNumber(product.marketScore.average, {
            maximumFractionDigits: 1,
          })} van 5 (${product.marketScore.sourceName}${product.marketScore.scope === "brand" ? ", merkniveau" : ""}).`
        : `Het model scoort goed op specificaties en is bedoeld voor professionele installatie.`;

  const expandableSentence = product.expandable ? " De capaciteit is bovendien uitbreidbaar." : "";

  return `${specSentence} ${ratingSentence}${expandableSentence}`;
}

export default async function BestFixedBatteryPage() {
  const result = await getProducts({
    productType: "fixed",
    sort: "capacity_desc",
    pageSize: 10,
  });
  const products = result.items;

  const structuredData = itemListJsonLd(
    products.map((product) => ({
      name: product.name,
      url: productDetailPath(product.slug, product.productType),
    })),
  );

  return (
    <main id="main-content">
      <JsonLd data={structuredData} />

      <div className="border-border/70 from-primary/5 border-b bg-gradient-to-b to-transparent">
        <Container className="py-10 sm:py-14">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            Vaste thuisbatterijen
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Beste vaste thuisbatterij
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
            Een vaste thuisbatterij vraagt om installatie. We zetten de modellen met de grootste
            capaciteit op een rij, zodat je snel ziet welke systemen interessant zijn voor een
            vrijblijvende offerte.
          </p>
          <div className="border-border bg-card text-muted-foreground mt-6 rounded-xl border p-4 text-sm leading-relaxed">
            <p>
              <span className="text-foreground font-semibold">Hoe wij rangschikken:</span> deze
              volgorde is gebaseerd op capaciteit en onderliggende specificaties. We tonen geen
              verzonnen webshopprijzen: vaste systemen lopen via offerte. Lees precies{" "}
              <Link
                href={"/over-ons/hoe-wij-vergelijken" as Route}
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                hoe wij vergelijken
              </Link>
              .
            </p>
          </div>
        </Container>
      </div>

      <Container>
        <Section className="py-10 sm:py-14">
          <SectionHeading
            eyebrow="Topmodellen"
            title="Vaste thuisbatterijen op capaciteit"
            description="Elk model linkt door naar specificaties en een offerte-aanvraag bij onze installatiepartner."
          />

          {products.length === 0 ? (
            <p className="text-muted-foreground mt-8">
              Er zijn nog geen vaste thuisbatterijen beschikbaar om te rangschikken.
            </p>
          ) : (
            <ol className="mt-8 space-y-5">
              {products.map((product, index) => {
                const href = productDetailPath(product.slug, product.productType);
                return (
                  <li key={product.id}>
                    <Card interactive className="group relative overflow-hidden">
                      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-6">
                        <div className="bg-primary text-primary-foreground flex size-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                            {product.brand.name}
                          </p>
                          <h2 className="group-hover:text-primary mt-0.5 text-xl font-bold tracking-tight transition-colors">
                            <Link href={href as Route} className="after:absolute after:inset-0">
                              {product.name}
                            </Link>
                          </h2>
                          <div className="mt-2">
                            <ProductRatingDisplay
                              rating={product.rating}
                              marketScore={product.marketScore}
                              showSource={false}
                            />
                          </div>

                          <ul className="mt-3 flex flex-wrap gap-1.5">
                            {product.capacityKwh !== null && (
                              <li className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium">
                                <BatteryCharging className="size-3.5" aria-hidden />
                                {formatNumber(product.capacityKwh)} kWh
                              </li>
                            )}
                            {product.powerKw !== null && (
                              <li className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium">
                                <Zap className="size-3.5" aria-hidden />
                                {formatNumber(product.powerKw)} kW
                              </li>
                            )}
                            {product.warrantyYears !== null && (
                              <li className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium">
                                <ShieldCheck className="size-3.5" aria-hidden />
                                {product.warrantyYears} jr garantie
                              </li>
                            )}
                          </ul>

                          <p className="text-muted-foreground mt-3 leading-relaxed">
                            {rankingReason(product)}
                          </p>
                        </div>

                        <div className="border-border shrink-0 border-t pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
                          <span className="text-muted-foreground block text-xs">Prijs</span>
                          <span className="text-lg font-bold tracking-tight">Via offerte</span>
                          <Link
                            href={href as Route}
                            className={cn(buttonVariants({ size: "sm" }), "relative z-10 mt-3")}
                          >
                            Vraag offerte
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="border-border bg-card mt-12 rounded-2xl border p-6 sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight">Zelf de knoop doorhakken?</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Gebruik de beslishulp voor een persoonlijk advies, of bekijk alle vaste
              thuisbatterijen en vraag een vrijblijvende offerte aan.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href={"/beslishulp" as Route} className={cn(buttonVariants({ size: "lg" }))}>
                Start de beslishulp
              </Link>
              <Link
                href={"/vaste-thuisbatterijen" as Route}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                Bekijk vaste systemen
              </Link>
            </div>
          </div>
        </Section>
      </Container>
    </main>
  );
}
