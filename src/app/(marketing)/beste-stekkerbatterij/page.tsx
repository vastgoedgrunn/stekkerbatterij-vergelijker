import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { BatteryCharging, ShieldCheck, Zap } from "lucide-react";
import { getProducts } from "@/features/products/queries";
import type { ProductListItem } from "@/features/products/types";
import { productDetailPath } from "@/features/products/product-paths";
import { ProductRatingDisplay } from "@/components/patterns/product-rating-display";
import { AffiliateDisclosure } from "@/components/patterns/affiliate-disclosure";
import { Container, Section, SectionHeading } from "@/components/patterns/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { OfferLink } from "@/features/offers-pricing/offer-link";
import { JsonLd } from "@/components/seo/json-ld";
import { itemListJsonLd } from "@/lib/seo/json-ld";
import { formatNumber, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { EDITORS_FAVORITE_PLUG_IN_SLUG } from "@/config/editors-picks";

export const revalidate = 3600;

const title = "Beste stekkerbatterij 2026: onze top 10";
const description =
  "Onze onafhankelijke ranglijst van de beste plug-and-play stekkerbatterijen van 2026, met onze favoriet en de scherpste prijs per kWh. Vergelijk capaciteit, vermogen, garantie en prijs.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/beste-stekkerbatterij" },
  openGraph: {
    title,
    description,
    type: "website",
    url: `${siteConfig.url}/beste-stekkerbatterij`,
  },
};

/** Korte redactie-oordelen voor topmodellen (geen verzonnen specs of prijzen). */
const EDITORIAL: Record<string, string> = {
  "anker-solix-solarbank-max-ac":
    "Onze favoriet voor wie serieus opslag en vermogen wil zonder vaste installatie. 7 kWh basis, tot 3,5 kW, uitbreidbaar tot 42 kWh: de sterkste plug-in in ons overzicht. Let op: boven ongeveer 800 W is een eigen groep of installateur verstandig.",
  "zendure-solarflow-800":
    "Sterke allrounder als je eerst wilt starten zonder installateur. Scherpe prijs per kWh en uitbreidbaar, ideaal als je later capaciteit wilt bijplaatsen. Let op: 0,8 kW vermogen is genoeg voor huishoudelijke basis, niet voor grote pieken.",
  "marstek-venus-512":
    "Veel capaciteit voor de prijs per kWh, dus interessant bij hoger verbruik. De externe merkscore is duidelijk lager dan bij topmerken: weeg capaciteit af tegen merkreputatie en service. Alleen kiezen als je die trade-off bewust accepteert.",
  "homewizard-plug-in-battery":
    "Logische keuze als je al in het HomeWizard-ecosysteem zit. Compact en app-gedreven, met gemiddelde merkscore. Minder sterk als je puur op laagste prijs per kWh of maximale garantie let.",
  "zendure-solarflow-hyper-2000":
    "Meer vermogen dan de SolarFlow 800 bij vergelijkbare capaciteit. Geschikt als je zonne-overschot sneller wilt wegschrijven. Productscore is stevig; check wel of de Hyper-setup bij jouw omvormer past.",
  "growatt-noah-2000":
    "Solide middenmoot op prijs per kWh, met fatsoenlijke productscore. Past bij wie Growatt-panelen of -omvormers heeft. Geen uitblinker op één metric, wel een evenwichtige optie.",
  "ecoflow-powerstream-800":
    "Bekend merk met sterke productscore. Goed als merkvertrouwen zwaarder weegt dan absolute laagste €/kWh. Vermogen blijft 0,8 kW, dus geen high-power setup.",
  "anker-solix-solarbank-2-e1600-pro":
    "Compacte Pro-variant met goede productscore. Interessant voor balkon of kleinere installaties. Capaciteit is beperkter: eerder een startpunt dan een huishouden-dekkende oplossing.",
  "anker-solix-solarbank-2-e1600":
    "Instapmodel binnen Anker SOLIX. Handig als je het merk wilt, maar op €/kWh vaak duurder dan grotere concurrenten. Kijk eerst of de Pro of een groter model beter past.",
  "ecoflow-stream-ac-pro":
    "Nieuwere EcoFlow-lijn met solide productscore. Sterk als je EcoFlow-ecosysteem prefereert. Vergelijk altijd de actuele €/kWh met Zendure en Growatt voordat je beslist.",
};

function rankingReason(product: ProductListItem, index: number): string {
  const editorial = EDITORIAL[product.slug];
  if (editorial && index < 5) return editorial;
  if (editorial) return editorial;

  const facts: string[] = [];
  if (product.capacityKwh !== null) {
    facts.push(`${formatNumber(product.capacityKwh)} kWh capaciteit`);
  }
  if (product.powerKw !== null) {
    facts.push(`${formatNumber(product.powerKw)} kW vermogen`);
  }
  if (product.warrantyYears !== null) {
    facts.push(`${product.warrantyYears} jaar garantie`);
  }

  const base =
    facts.length > 0
      ? `${product.name}: ${facts.join(", ")}.`
      : `${product.name} van ${product.brand.name}.`;

  const score =
    product.marketScore != null
      ? ` Externe score ${formatNumber(product.marketScore.average, {
          maximumFractionDigits: 1,
        })}/5 via ${product.marketScore.sourceName}${
          product.marketScore.scope === "brand" ? " (merk)" : ""
        }.`
      : "";

  const expandable = product.expandable ? " Uitbreidbaar." : "";
  return `${base}${score}${expandable}`;
}

function RankingOfferColumn({ product }: { product: ProductListItem }) {
  const outbound = product.bestOffer?.affiliateUrl ? product.bestOffer : null;
  return (
    <div className="border-border flex w-full shrink-0 flex-col gap-3 border-t pt-4 sm:w-52 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
      {product.lowestPriceCents !== null ? (
        <>
          <span className="text-muted-foreground block text-xs">vanaf</span>
          <span className="text-2xl font-bold tracking-tight">
            {formatPrice(product.lowestPriceCents)}
          </span>
        </>
      ) : (
        <span className="text-muted-foreground text-sm">Prijs volgt</span>
      )}
      {outbound ? (
        <OfferLink
          offerId={outbound.id}
          productId={product.id}
          merchant={outbound.merchantName}
          sponsored={outbound.isSponsored}
          estimatedCommissionCents={outbound.estimatedCommissionCents}
          placement="seo_ranking"
          size="sm"
          className="w-full"
        >
          Naar {outbound.merchantName}
        </OfferLink>
      ) : (
        <Link
          href={productDetailPath(product.slug, "plug_in") as Route}
          className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}
        >
          Bekijk product
        </Link>
      )}
    </div>
  );
}

function EditorsPickCard({ product }: { product: ProductListItem }) {
  return (
    <Card interactive className="border-primary/40 ring-primary/15 group overflow-hidden ring-2">
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-6">
        <div className="flex shrink-0 flex-col items-start gap-2">
          <Badge variant="highlight">Onze favoriet</Badge>
          <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-xl text-sm font-bold">
            #1
          </div>
        </div>
        <div className="flex-1">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {product.brand.name}
          </p>
          <h2 className="group-hover:text-primary mt-0.5 text-xl font-bold tracking-tight transition-colors sm:text-2xl">
            <Link href={productDetailPath(product.slug, "plug_in") as Route}>{product.name}</Link>
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
            {EDITORIAL[product.slug] ?? rankingReason(product, 0)}
          </p>
        </div>
        <RankingOfferColumn product={product} />
      </div>
    </Card>
  );
}

export default async function BestBatteryPage() {
  const result = await getProducts({
    productType: "plug_in",
    sort: "value_asc",
    pageSize: 24,
  });
  const priced = result.items.filter((p) => p.lowestPriceCents !== null);
  const editorsPick =
    priced.find((p) => p.slug === EDITORS_FAVORITE_PLUG_IN_SLUG) ??
    result.items.find((p) => p.slug === EDITORS_FAVORITE_PLUG_IN_SLUG) ??
    null;
  const products = priced.filter((p) => p.slug !== EDITORS_FAVORITE_PLUG_IN_SLUG).slice(0, 10);

  const structuredData = itemListJsonLd(
    [editorsPick, ...products]
      .filter((p): p is ProductListItem => Boolean(p))
      .map((product) => ({
        name: product.name,
        url: productDetailPath(product.slug, "plug_in"),
      })),
  );

  return (
    <main id="main-content">
      <JsonLd data={structuredData} />

      <div className="border-border/70 from-primary/5 border-b bg-gradient-to-b to-transparent">
        <Container className="py-10 sm:py-14">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            Ranglijst 2026
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Beste stekkerbatterij van 2026
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
            Onze favoriet voor maximale opslag en vermogen, plus de top 10 op scherpste prijs per
            kWh. Zo zie je snel welke thuisaccu past bij capaciteit, vermogen, garantie en budget.
          </p>
          <div className="border-border bg-card text-muted-foreground mt-6 rounded-xl border p-4 text-sm leading-relaxed">
            <p>
              <span className="text-foreground font-semibold">Hoe wij rangschikken:</span> onze
              favoriet is een redactiekeuze op capaciteit, vermogen en gebruiksgemak. De top 10
              daaronder sorteert op laagste actuele prijs per kWh onder gepubliceerde
              stekkerbatterijen met live aanbieder. Lees{" "}
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
        {editorsPick && (
          <Section className="pt-10 pb-4 sm:pt-14">
            <SectionHeading
              eyebrow="Onze favoriet"
              title="Beste overall keuze"
              description="Meeste opslag en vermogen in plug-and-play vorm. Ideaal als je serieus wilt besparen op teruglevering."
            />
            <div className="mt-6">
              <EditorsPickCard product={editorsPick} />
            </div>
          </Section>
        )}

        <Section className="py-10 sm:py-14">
          <SectionHeading
            eyebrow="Top 10"
            title="Scherpste prijs per kWh"
            description="Elk model linkt door naar specificaties en het actuele prijsoverzicht."
          />

          {products.length === 0 ? (
            <p className="text-muted-foreground mt-8">
              Er zijn nog geen stekkerbatterijen met live prijs om te rangschikken.
            </p>
          ) : (
            <ol className="mt-8 space-y-5">
              {products.map((product, index) => (
                <li key={product.id}>
                  <Card interactive className="group overflow-hidden">
                    <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-6">
                      <div className="bg-primary text-primary-foreground flex size-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                          {product.brand.name}
                        </p>
                        <h2 className="group-hover:text-primary mt-0.5 text-xl font-bold tracking-tight transition-colors">
                          <Link href={productDetailPath(product.slug, "plug_in") as Route}>
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
                          {rankingReason(product, index)}
                        </p>
                      </div>
                      <RankingOfferColumn product={product} />
                    </div>
                  </Card>
                </li>
              ))}
            </ol>
          )}

          <AffiliateDisclosure className="mt-6" />

          <div className="border-border bg-card mt-12 rounded-2xl border p-6 sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight">Zelf de knoop doorhakken?</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Gebruik de beslishulp voor een persoonlijk advies, of vergelijk alle stekkerbatterijen
              op eigen filters.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href={"/beslishulp" as Route} className={cn(buttonVariants({ size: "lg" }))}>
                Start de beslishulp
              </Link>
              <Link
                href={"/stekkerbatterijen" as Route}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                Bekijk stekkerbatterijen
              </Link>
            </div>
          </div>
        </Section>
      </Container>
    </main>
  );
}
