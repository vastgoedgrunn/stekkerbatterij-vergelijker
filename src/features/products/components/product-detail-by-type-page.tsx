import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BatteryCharging, ChevronRight, ShieldCheck, Truck, Zap } from "lucide-react";
import { ProductImage } from "@/components/patterns/product-image";
import { getProductBySlug, getProductSlugs } from "@/features/products/queries";
import { getFaqs } from "@/features/content/queries";
import { getApprovedReviews } from "@/features/reviews/queries";
import { SpecList } from "@/features/products/components/spec-list";
import { OfferTable } from "@/features/offers-pricing/offer-table";
import { OfferLink } from "@/features/offers-pricing/offer-link";
import { PdpStickyOfferAnchor } from "@/features/offers-pricing/pdp-sticky-offer-anchor";
import { PriceCheckedLabel } from "@/features/offers-pricing/price-checked-label";
import { isOfferFresh } from "@/features/offers-pricing/offer-freshness";
import { DropshipPriceHint } from "@/features/offers-pricing/dropship-price-hint";
import { TrackView } from "@/lib/observability/track-view";
import { PriceHistoryChart } from "@/features/offers-pricing/price-history-chart";
import { ReviewList } from "@/features/reviews/review-list";
import { ReviewForm } from "@/features/reviews/review-form";
import { ProductRatingDisplay } from "@/components/patterns/product-rating-display";
import { FaqAccordion } from "@/components/patterns/faq-accordion";
import { AffiliateDisclosure } from "@/components/patterns/affiliate-disclosure";
import { Container } from "@/components/patterns/section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CompareToggle } from "@/features/comparison/compare-toggle";
import { FixedBatteryLeadPanel } from "@/features/comparison/fixed-battery-lead-panel";
import { serverEnv } from "@/lib/env/server";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, faqJsonLd, productJsonLd } from "@/lib/seo/json-ld";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { formatNumber, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import type { ProductType } from "@/features/products/types";
import {
  catalogBasePath,
  productDetailPath,
  productTypeBadge,
  productTypeLabel,
} from "@/features/products/product-paths";
import { EDITORS_FAVORITE_PLUG_IN_SLUG } from "@/config/editors-picks";

export const revalidate = 3600;

export async function productDetailGenerateStaticParams(
  productType: Exclude<ProductType, "accessory">,
) {
  const slugs = await getProductSlugs(productType);
  return slugs.map((slug) => ({ slug }));
}

export async function productDetailGenerateMetadata(
  slug: string,
  expectedType: Exclude<ProductType, "accessory">,
): Promise<Metadata> {
  const product = await getProductBySlug(slug);
  if (!product || product.productType !== expectedType) {
    return { title: "Product niet gevonden" };
  }

  const path = productDetailPath(product.slug, product.productType);
  const description =
    product.summary ??
    (expectedType === "fixed"
      ? `Specificaties en vrijblijvende offerte voor de ${product.name} van ${product.brand.name}.`
      : `Bekijk specificaties, prijzen en reviews van de ${product.name} van ${product.brand.name}.`);
  const imageUrl = getPublicImageUrl(product.imagePath);
  const title =
    expectedType === "fixed"
      ? `${product.name}: specs en offerte`
      : `${product.name}: specificaties en prijzen`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      url: `${siteConfig.url}${path}`,
      ...(imageUrl ? { images: [{ url: imageUrl, alt: product.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export async function ProductDetailByTypePage({
  slug,
  expectedType,
}: {
  slug: string;
  expectedType: Exclude<ProductType, "accessory">;
}) {
  const product = await getProductBySlug(slug);
  if (!product || product.productType !== expectedType) notFound();

  const [reviews, faqsRaw] = await Promise.all([getApprovedReviews(product.id), getFaqs()]);
  const faqs =
    expectedType === "fixed"
      ? faqsRaw.filter((f) => !/stekkerbatterij/i.test(f.question))
      : faqsRaw;
  const imageUrl = getPublicImageUrl(product.imagePath);
  const isFixed = product.productType === "fixed";
  const isEditorsFavorite = product.slug === EDITORS_FAVORITE_PLUG_IN_SLUG;
  const basePath = catalogBasePath(expectedType);
  const detailPath = productDetailPath(product.slug, product.productType);

  const outboundOffers = product.offers.filter((o) => o.affiliateUrl);
  const freshOutbound = outboundOffers.filter((o) => isOfferFresh(o.lastCheckedAt));
  const bestOffer = [...(freshOutbound.length > 0 ? freshOutbound : outboundOffers)].sort(
    (a, b) => a.priceCents - b.priceCents,
  )[0];

  const quickSpecs = [
    product.capacityKwh !== null && {
      icon: BatteryCharging,
      label: "Capaciteit",
      value: `${formatNumber(product.capacityKwh)} kWh`,
    },
    product.powerKw !== null && {
      icon: Zap,
      label: "Vermogen",
      value: `${formatNumber(product.powerKw)} kW`,
    },
    product.warrantyYears !== null && {
      icon: ShieldCheck,
      label: "Garantie",
      value: `${product.warrantyYears} jaar`,
    },
  ].filter(Boolean) as { icon: typeof ShieldCheck; label: string; value: string }[];

  const structuredData: Record<string, unknown>[] = [
    productJsonLd(product),
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: productTypeLabel(product.productType), url: basePath },
      { name: product.name, url: detailPath },
    ]),
  ];
  const faqLd = faqJsonLd(faqs);
  if (faqLd) structuredData.push(faqLd);

  const indicativeLabel =
    product.indicativePriceMinCents != null
      ? product.indicativePriceMaxCents != null &&
        product.indicativePriceMaxCents !== product.indicativePriceMinCents
        ? `${formatPrice(product.indicativePriceMinCents)} tot ${formatPrice(product.indicativePriceMaxCents)}`
        : `vanaf ${formatPrice(product.indicativePriceMinCents)}`
      : null;

  return (
    <main id="main-content">
      <JsonLd data={structuredData} />
      <TrackView
        event={{
          name: "product_detail_viewed",
          props: { productId: product.id, slug: product.slug },
        }}
      />

      <Container className="py-8">
        <nav aria-label="Kruimelpad" className="text-muted-foreground mb-6 text-sm">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <ChevronRight className="size-4" aria-hidden />
            <li>
              <Link href={basePath} className="hover:text-foreground">
                {productTypeLabel(product.productType)}
              </Link>
            </li>
            <ChevronRight className="size-4" aria-hidden />
            <li className="text-foreground font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <ProductImage
            src={imageUrl}
            alt={product.name}
            aspect="square"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            imageClassName="p-8 sm:p-10"
          >
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
              {isEditorsFavorite && <Badge variant="highlight">Beste koop</Badge>}
              <Badge variant={isFixed ? "muted" : "highlight"}>
                {productTypeBadge(product.productType)}
              </Badge>
              {product.expandable && <Badge variant="highlight">Uitbreidbaar</Badge>}
            </div>
          </ProductImage>

          <div className="flex flex-col gap-5">
            <div>
              <p className="text-primary text-sm font-semibold tracking-wide uppercase">
                {product.brand.name}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>
              <div className="mt-3">
                <ProductRatingDisplay
                  rating={product.rating}
                  marketScore={product.marketScore}
                  showSource
                />
              </div>
            </div>

            {product.summary && (
              <p className="text-muted-foreground leading-relaxed">{product.summary}</p>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {quickSpecs.map((spec) => (
                <div key={spec.label} className="border-border bg-card rounded-xl border p-3">
                  <spec.icon className="text-primary size-4" />
                  <p className="mt-2 text-sm font-bold">{spec.value}</p>
                  <p className="text-muted-foreground text-xs">{spec.label}</p>
                </div>
              ))}
            </div>

            {isFixed ? (
              <div className="space-y-4">
                <div className="border-border bg-card rounded-2xl border p-5 shadow-[var(--shadow-sm)]">
                  <p className="text-muted-foreground text-sm">
                    {indicativeLabel ? "Richtprijs inclusief installatie" : "Prijs"}
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">
                    {indicativeLabel ?? "Offerte op maat"}
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {indicativeLabel
                      ? "Indicatieve richtprijs inclusief installatie en btw. De definitieve prijs is altijd een offerte op maat van de installateur."
                      : "Geen webshopprijs: vaste systemen gaan via installateur. Vrijblijvend oriënteren."}
                  </p>
                  <div className="mt-4">
                    <CompareToggle slug={product.slug} name={product.name} />
                  </div>
                </div>
                <FixedBatteryLeadPanel
                  source="pdp"
                  productId={product.id}
                  productSlug={product.slug}
                  productName={product.name}
                  indicativePriceMinCents={product.indicativePriceMinCents}
                  indicativePriceMaxCents={product.indicativePriceMaxCents}
                  eWndrEnabled={Boolean(serverEnv.EWNDR_LEAD_AFFILIATE_URL)}
                />
              </div>
            ) : (
              <PdpStickyOfferAnchor
                productId={product.id}
                productName={product.name}
                bestOffer={bestOffer}
              >
                <div className="border-border bg-card rounded-2xl border p-5 shadow-[var(--shadow-sm)]">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm">Laagste prijs</p>
                      <p className="text-3xl font-bold tracking-tight">
                        {product.lowestPriceCents !== null
                          ? formatPrice(product.lowestPriceCents)
                          : "-"}
                      </p>
                      {bestOffer && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          bij {bestOffer.merchantName}
                        </p>
                      )}
                      {bestOffer && <PriceCheckedLabel checkedAt={bestOffer.lastCheckedAt} />}
                    </div>
                    {bestOffer?.deliveryDays != null && (
                      <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
                        <Truck className="size-4" /> {bestOffer.deliveryDays} werkdagen
                      </span>
                    )}
                    <DropshipPriceHint sellable={product.sellable} offers={product.offers} />
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    {bestOffer?.affiliateUrl ? (
                      <OfferLink
                        offerId={bestOffer.id}
                        productId={product.id}
                        merchant={bestOffer.merchantName}
                        sponsored={bestOffer.isSponsored}
                        estimatedCommissionCents={bestOffer.estimatedCommissionCents}
                        placement="pdp_hero"
                        size="lg"
                        className="flex-1"
                      >
                        Bekijk aanbieding
                      </OfferLink>
                    ) : (
                      <a
                        href="#aanbieders"
                        className={cn(buttonVariants({ size: "lg" }), "flex-1")}
                      >
                        Bekijk aanbieders
                      </a>
                    )}
                    <CompareToggle slug={product.slug} name={product.name} />
                  </div>
                  {bestOffer?.isSponsored && (
                    <Badge variant="muted" className="mt-3">
                      Advertentie
                    </Badge>
                  )}
                  {product.offerCount > 1 && (
                    <a
                      href="#aanbieders"
                      className="text-primary mt-3 block text-center text-sm font-medium underline-offset-4 hover:underline"
                    >
                      Vergelijk {product.offerCount} aanbieders
                    </a>
                  )}
                  <p className="text-muted-foreground mt-3 text-center text-xs">
                    Prijs incl. btw · controleer de actuele prijs bij de aanbieder
                  </p>
                  <AffiliateDisclosure className="mt-3" />
                </div>
              </PdpStickyOfferAnchor>
            )}
          </div>
        </div>

        <div className="mt-16 grid gap-16 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-16">
            {!isFixed && (
              <section aria-labelledby="aanbieders">
                <h2 id="aanbieders" className="mb-5 text-2xl font-bold tracking-tight">
                  Prijzen &amp; aanbieders
                </h2>
                <OfferTable
                  offers={product.offers}
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    brandName: product.brand.name,
                    imagePath: product.imagePath,
                    supplierId: product.supplierId,
                    sellable: product.sellable,
                  }}
                />
                <AffiliateDisclosure className="mt-4" />
              </section>
            )}

            <section aria-labelledby="specificaties">
              <h2 id="specificaties" className="mb-5 text-2xl font-bold tracking-tight">
                Specificaties
              </h2>
              <SpecList product={product} />
            </section>

            {!isFixed && product.priceHistory.length >= 2 && (
              <section aria-labelledby="prijsontwikkeling">
                <h2 id="prijsontwikkeling" className="mb-5 text-2xl font-bold tracking-tight">
                  Prijsontwikkeling
                </h2>
                <div className="border-border bg-card rounded-2xl border p-5">
                  <PriceHistoryChart points={product.priceHistory} />
                </div>
              </section>
            )}

            {product.description && (
              <section aria-labelledby="beschrijving">
                <h2 id="beschrijving" className="mb-5 text-2xl font-bold tracking-tight">
                  Over deze batterij
                </h2>
                <p className="text-muted-foreground max-w-3xl leading-relaxed">
                  {product.description}
                </p>
              </section>
            )}

            <section aria-labelledby="reviews">
              <h2 id="reviews" className="mb-5 text-2xl font-bold tracking-tight">
                Reviews &amp; scores
              </h2>
              <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
                <div className="space-y-4">
                  {product.marketScore &&
                    !(product.rating.average !== null && product.rating.count > 0) && (
                      <div className="border-border bg-card rounded-2xl border p-5">
                        <p className="text-sm font-semibold">Externe marktscore</p>
                        <div className="mt-2">
                          <ProductRatingDisplay
                            rating={product.rating}
                            marketScore={product.marketScore}
                            showSource
                          />
                        </div>
                        <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                          Dit is geen review op onze site, maar een citeerbare score van{" "}
                          {product.marketScore.sourceName}
                          {product.marketScore.scope === "brand"
                            ? " op merkniveau"
                            : " voor dit product"}
                          .
                        </p>
                      </div>
                    )}
                  <ReviewList reviews={reviews} marketScore={product.marketScore} />
                </div>
                <details className="border-border bg-card rounded-2xl border p-5">
                  <summary className="cursor-pointer text-lg font-semibold">
                    Schrijf een review
                  </summary>
                  <div className="mt-4">
                    <ReviewForm productId={product.id} productSlug={product.slug} />
                  </div>
                </details>
              </div>
            </section>
          </div>

          {faqs.length > 0 && (
            <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="faq">
              <h2 id="faq" className="mb-5 text-2xl font-bold tracking-tight">
                Veelgestelde vragen
              </h2>
              <FaqAccordion faqs={faqs} />
            </aside>
          )}
        </div>
      </Container>
    </main>
  );
}
