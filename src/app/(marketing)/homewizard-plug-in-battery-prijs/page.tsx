import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { getProductBySlug } from "@/features/products/queries";
import { productDetailPath } from "@/features/products/product-paths";
import { AffiliateDisclosure } from "@/components/patterns/affiliate-disclosure";
import { Container, Section } from "@/components/patterns/section";
import { buttonVariants } from "@/components/ui/button";
import { OfferLink } from "@/features/offers-pricing/offer-link";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

const title = "HomeWizard Plug-In Battery: prijs vergelijken";
const description =
  "Vergelijk de actuele prijs van de HomeWizard Plug-In Battery, specificaties en externe marktscore. Direct door naar de aanbieder.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/homewizard-plug-in-battery-prijs" },
  openGraph: {
    title,
    description,
    url: `${siteConfig.url}/homewizard-plug-in-battery-prijs`,
  },
};

export default async function HomeWizardPrijsPage() {
  const product = await getProductBySlug("homewizard-plug-in-battery");
  const href = product
    ? productDetailPath(product.slug, product.productType)
    : ("/stekkerbatterijen" as Route);
  const best = product?.bestOffer?.affiliateUrl ? product.bestOffer : null;

  return (
    <main id="main-content">
      <div className="border-border/70 from-primary/5 border-b bg-gradient-to-b to-transparent">
        <Container className="py-10 sm:py-14">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            Prijsvergelijking
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            HomeWizard Plug-In Battery prijs
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
            Compacte stekkerbatterij voor wie al HomeWizard gebruikt. Hier zie je de laagste
            gecontroleerde prijs en de link naar de aanbieder.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            {product?.lowestPriceCents != null ? (
              <p className="text-2xl font-bold tracking-tight">
                vanaf {formatPrice(product.lowestPriceCents)}
                {best ? (
                  <span className="text-muted-foreground ml-2 text-base font-medium">
                    bij {best.merchantName}
                  </span>
                ) : null}
              </p>
            ) : null}
            {product && best ? (
              <OfferLink
                offerId={best.id}
                productId={product.id}
                merchant={best.merchantName}
                sponsored={best.isSponsored}
                estimatedCommissionCents={best.estimatedCommissionCents}
                placement="seo_price"
                size="lg"
              >
                Naar {best.merchantName}
              </OfferLink>
            ) : null}
            <Link
              href={href as Route}
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              {product ? "Bekijk productpagina" : "Bekijk stekkerbatterijen"}
            </Link>
          </div>
          <AffiliateDisclosure className="mt-4" />
        </Container>
      </div>
      <Section>
        <Container className="max-w-3xl space-y-4 text-sm leading-relaxed">
          <p>
            De HomeWizard Plug-In Battery is populair in Nederland dankzij de app-integratie. Op
            onze productpagina zie je capaciteit
            {product?.capacityKwh != null ? ` (${product.capacityKwh} kWh)` : ""}, vermogen,
            garantie en de controledatum van de prijs.
          </p>
          <p>
            Twijfel je tussen HomeWizard en een scherpere €/kWh-optie zoals Zendure? Gebruik de{" "}
            <Link
              href={"/beslishulp" as Route}
              className="text-primary font-medium hover:underline"
            >
              beslishulp
            </Link>{" "}
            of zet ze naast elkaar in de{" "}
            <Link
              href={"/vergelijken?ids=homewizard-plug-in-battery,zendure-solarflow-800" as Route}
              className="text-primary font-medium hover:underline"
            >
              vergelijker
            </Link>
            .
          </p>
        </Container>
      </Section>
    </main>
  );
}
