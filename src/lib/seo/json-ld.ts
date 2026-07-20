import { siteConfig } from "@/config/site";
import type { ProductDetail } from "@/features/products/types";
import type { Faq } from "@/features/content/types";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { productDetailPath } from "@/features/products/product-paths";

type JsonLdObject = Record<string, unknown>;

export function organizationJsonLd(): JsonLdObject {
  // Google wil bij voorkeur een vierkant logo (min. 112×112); logo-mark is 279×279.
  const markUrl = `${siteConfig.url}${siteConfig.logoMarkPath}`;
  const fullLogoUrl = `${siteConfig.url}${siteConfig.logoPath}`;
  const org: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    alternateName: ["Stekkerbatterijvergelijker", siteConfig.shortName],
    url: siteConfig.url,
    description: siteConfig.description,
    email: siteConfig.contactEmail,
    logo: {
      "@type": "ImageObject",
      url: markUrl,
      width: 279,
      height: 279,
      contentUrl: markUrl,
    },
    image: [markUrl, fullLogoUrl],
  };
  const twitter = siteConfig.twitterHandle as string | undefined;
  if (twitter) {
    org.sameAs = [`https://twitter.com/${twitter.replace(/^@/, "")}`];
  }
  return org;
}

export function websiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: siteConfig.url,
    inLanguage: siteConfig.language,
    description: siteConfig.description,
    publisher: { "@id": `${siteConfig.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/stekkerbatterijen?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

export function itemListJsonLd(items: { name: string; url: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

export function productJsonLd(product: ProductDetail): JsonLdObject {
  const productUrl = `${siteConfig.url}${productDetailPath(product.slug, product.productType)}`;
  const imageUrl = getPublicImageUrl(product.imagePath);

  const pricedOffers = product.offers.filter((offer) => offer.priceCents > 0);
  const omitOffers = product.productType === "fixed" && pricedOffers.length === 0;

  const offers = omitOffers
    ? undefined
    : pricedOffers.map((offer) => {
        const offerLd: JsonLdObject = {
          "@type": "Offer",
          price: (offer.priceCents / 100).toFixed(2),
          priceCurrency: "EUR",
          availability:
            offer.stockStatus === "in_stock"
              ? "https://schema.org/InStock"
              : offer.stockStatus === "preorder"
                ? "https://schema.org/PreOrder"
                : "https://schema.org/OutOfStock",
          seller: { "@type": "Organization", name: offer.merchantName },
        };
        if (offer.affiliateUrl) {
          offerLd.url = offer.affiliateUrl;
        }
        return offerLd;
      });

  const base: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand.name },
    description: product.summary ?? product.description ?? undefined,
    url: productUrl,
  };

  if (offers && offers.length > 0) {
    base.offers = offers;
  }

  if (imageUrl) {
    base.image = imageUrl;
  }

  // AggregateRating uitsluitend bij échte reviews (voorkomt Google-penalty).
  if (product.rating.average !== null && product.rating.count > 0) {
    base.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating.average,
      reviewCount: product.rating.count,
    };
  }

  return base;
}

export function faqJsonLd(faqs: Faq[]): JsonLdObject | null {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function articleJsonLd(article: {
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string | null;
  updatedAt?: string | null;
  imageUrl?: string | null;
}): JsonLdObject {
  const articleUrl = `${siteConfig.url}/gidsen/${article.slug}`;
  const ld: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? undefined,
    datePublished: article.publishedAt ?? undefined,
    dateModified: article.updatedAt ?? article.publishedAt ?? undefined,
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}${siteConfig.logoMarkPath}`,
        width: 279,
        height: 279,
      },
    },
  };
  if (article.imageUrl) {
    ld.image = [article.imageUrl];
  }
  return ld;
}
