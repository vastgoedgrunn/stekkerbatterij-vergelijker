import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BatteryCharging } from "lucide-react";
import { getProductBySlug, getProductSlugs } from "@/features/products/queries";
import { getFaqs } from "@/features/content/queries";
import { getApprovedReviews } from "@/features/reviews/queries";
import { SpecList } from "@/features/products/components/spec-list";
import { OfferTable } from "@/features/offers-pricing/offer-table";
import { PriceHistoryChart } from "@/features/offers-pricing/price-history-chart";
import { ReviewList } from "@/features/reviews/review-list";
import { ReviewForm } from "@/features/reviews/review-form";
import { RatingStars } from "@/components/patterns/rating-stars";
import { FaqAccordion } from "@/components/patterns/faq-accordion";
import { Badge } from "@/components/ui/badge";
import { CompareToggle } from "@/features/comparison/compare-toggle";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, faqJsonLd, productJsonLd } from "@/lib/seo/json-ld";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { formatPrice } from "@/lib/format";
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
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <JsonLd data={structuredData} />

      <nav aria-label="Kruimelpad" className="text-muted-foreground mb-6 text-sm">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/batterijen" className="hover:underline">
              Batterijen
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="bg-muted relative flex aspect-4/3 items-center justify-center rounded-xl">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-6"
            />
          ) : (
            <BatteryCharging className="text-muted-foreground/40 size-24" aria-hidden />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              {product.brand.name}
            </p>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <RatingStars average={product.rating.average} count={product.rating.count} />
            {product.expandable && <Badge variant="secondary">Uitbreidbaar</Badge>}
          </div>

          {product.summary && <p className="text-muted-foreground">{product.summary}</p>}

          <div className="border-border flex items-end gap-4 rounded-xl border p-4">
            <div>
              <p className="text-muted-foreground text-sm">Laagste prijs</p>
              <p className="text-2xl font-bold">
                {product.lowestPriceCents !== null ? formatPrice(product.lowestPriceCents) : "—"}
              </p>
            </div>
            <CompareToggle slug={product.slug} className="ml-auto" />
          </div>

          <SpecList product={product} />
        </div>
      </div>

      <section className="mt-12" aria-labelledby="aanbieders">
        <h2 id="aanbieders" className="mb-4 text-2xl font-bold">
          Prijzen & aanbieders
        </h2>
        <OfferTable offers={product.offers} />
      </section>

      {product.priceHistory.length >= 2 && (
        <section className="mt-12" aria-labelledby="prijsontwikkeling">
          <h2 id="prijsontwikkeling" className="mb-4 text-2xl font-bold">
            Prijsontwikkeling
          </h2>
          <div className="border-border rounded-xl border p-4">
            <PriceHistoryChart points={product.priceHistory} />
          </div>
        </section>
      )}

      {product.description && (
        <section className="mt-12" aria-labelledby="beschrijving">
          <h2 id="beschrijving" className="mb-4 text-2xl font-bold">
            Over deze batterij
          </h2>
          <p className="text-muted-foreground max-w-3xl leading-relaxed">{product.description}</p>
        </section>
      )}

      <section className="mt-12" aria-labelledby="reviews">
        <h2 id="reviews" className="mb-4 text-2xl font-bold">
          Reviews
        </h2>
        <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
          <ReviewList reviews={reviews} />
          <div>
            <h3 className="mb-3 text-lg font-semibold">Schrijf een review</h3>
            <ReviewForm productId={product.id} productSlug={product.slug} />
          </div>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="mt-12" aria-labelledby="faq">
          <h2 id="faq" className="mb-4 text-2xl font-bold">
            Veelgestelde vragen
          </h2>
          <FaqAccordion faqs={faqs} />
        </section>
      )}
    </main>
  );
}
