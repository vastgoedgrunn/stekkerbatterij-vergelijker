import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BatteryCharging, ChevronRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { getProductBySlug, getProductSlugs } from "@/features/products/queries";
import { getFaqs } from "@/features/content/queries";
import { getApprovedReviews } from "@/features/reviews/queries";
import { SpecList } from "@/features/products/components/spec-list";
import { OfferTable } from "@/features/offers-pricing/offer-table";
import { OfferLink } from "@/features/offers-pricing/offer-link";
import { DropshipPriceHint } from "@/features/offers-pricing/dropship-price-hint";
import { TrackView } from "@/lib/observability/track-view";
import { PriceHistoryChart } from "@/features/offers-pricing/price-history-chart";
import { ReviewList } from "@/features/reviews/review-list";
import { ReviewForm } from "@/features/reviews/review-form";
import { RatingStars } from "@/components/patterns/rating-stars";
import { FaqAccordion } from "@/components/patterns/faq-accordion";
import { AffiliateDisclosure } from "@/components/patterns/affiliate-disclosure";
import { Container } from "@/components/patterns/section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CompareToggle } from "@/features/comparison/compare-toggle";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, faqJsonLd, productJsonLd } from "@/lib/seo/json-ld";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { formatNumber, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product niet gevonden" };

  const description =
    product.summary ??
    `Bekijk specificaties, prijzen en reviews van de ${product.name} van ${product.brand.name}.`;

  return {
    title: `${product.name} — specificaties & prijzen`,
    description,
    alternates: { canonical: `/batterijen/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      url: `${siteConfig.url}/batterijen/${product.slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, faqs] = await Promise.all([getApprovedReviews(product.id), getFaqs()]);
  const imageUrl = getPublicImageUrl(product.imagePath);

  const bestOffer = [...product.offers].sort((a, b) => a.priceCents - b.priceCents)[0];

  const quickSpecs = [
    product.capacityKwh !== null && {
      icon: BatteryCharging,
      label: "Capaciteit",
      value: `${formatNumber(product.capacityKwh)} kWh`,
    },
    product.powerKw !== null && {
      icon: Sparkles,
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
      { name: "Batterijen", url: "/batterijen" },
      { name: product.name, url: `/batterijen/${product.slug}` },
    ]),
  ];
  const faqLd = faqJsonLd(faqs);
  if (faqLd) structuredData.push(faqLd);

  return (
    <main>
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
              <Link href="/batterijen" className="hover:text-foreground">
                Batterijen
              </Link>
            </li>
            <ChevronRight className="size-4" aria-hidden />
            <li className="text-foreground font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          {/* GALLERY */}
          <div className="from-accent/50 via-muted border-border relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border bg-gradient-to-br to-transparent">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-10"
              />
            ) : (
              <BatteryCharging className="text-primary/25 size-24" aria-hidden />
            )}
            {product.expandable && (
              <Badge variant="highlight" className="absolute top-4 left-4">
                Uitbreidbaar
              </Badge>
            )}
          </div>

          {/* BUY INFO */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-primary text-sm font-semibold tracking-wide uppercase">
                {product.brand.name}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>
              <div className="mt-3">
                <RatingStars average={product.rating.average} count={product.rating.count} />
              </div>
            </div>

            {product.summary && (
              <p className="text-muted-foreground leading-relaxed">{product.summary}</p>
            )}

            <div className="grid grid-cols-3 gap-3">
              {quickSpecs.map((spec) => (
                <div key={spec.label} className="border-border bg-card rounded-xl border p-3">
                  <spec.icon className="text-primary size-4" />
                  <p className="mt-2 text-sm font-bold">{spec.value}</p>
                  <p className="text-muted-foreground text-xs">{spec.label}</p>
                </div>
              ))}
            </div>

            <div className="border-border bg-card rounded-2xl border p-5 shadow-[var(--shadow-sm)]">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Laagste prijs</p>
                  <p className="text-3xl font-bold tracking-tight">
                    {product.lowestPriceCents !== null
                      ? formatPrice(product.lowestPriceCents)
                      : "—"}
                  </p>
                  {bestOffer && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      bij {bestOffer.merchantName}
                    </p>
                  )}
                  <DropshipPriceHint sellable={product.sellable} offers={product.offers} />
                </div>
                {bestOffer?.deliveryDays != null && (
                  <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
                    <Truck className="size-4" /> {bestOffer.deliveryDays} werkdagen
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                {bestOffer?.affiliateUrl ? (
                  <OfferLink
                    offerId={bestOffer.id}
                    productId={product.id}
                    merchant={bestOffer.merchantName}
                    sponsored={bestOffer.isSponsored}
                    estimatedCommissionCents={bestOffer.estimatedCommissionCents}
                    size="lg"
                    className="flex-1"
                  >
                    Bekijk beste prijs
                  </OfferLink>
                ) : (
                  <a href="#aanbieders" className={cn(buttonVariants({ size: "lg" }), "flex-1")}>
                    Bekijk aanbieders
                  </a>
                )}
                <CompareToggle slug={product.slug} />
              </div>
              <p className="text-muted-foreground mt-3 text-center text-xs">
                Prijs incl. btw · controleer de actuele prijs bij de aanbieder
              </p>
              <AffiliateDisclosure className="mt-3" />
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-16 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-16">
            <section aria-labelledby="specificaties">
              <h2 id="specificaties" className="mb-5 text-2xl font-bold tracking-tight">
                Specificaties
              </h2>
              <SpecList product={product} />
            </section>

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

            {product.priceHistory.length >= 2 && (
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
                Reviews
              </h2>
              <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
                <ReviewList reviews={reviews} />
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Schrijf een review</h3>
                  <ReviewForm productId={product.id} productSlug={product.slug} />
                </div>
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
