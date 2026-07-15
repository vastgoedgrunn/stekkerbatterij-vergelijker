import { siteConfig } from "@/config/site";
import type { ProductDetail } from "@/features/products/types";
import type { Faq } from "@/features/content/types";
import { getPublicImageUrl } from "@/lib/supabase/storage";

type JsonLdObject = Record<string, unknown>;

export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}

export function websiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: siteConfig.language,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/batterijen?q={search_term_string}`,
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
  const productUrl = `${siteConfig.url}/batterijen/${product.slug}`;
  const imageUrl = getPublicImageUrl(product.imagePath);

  const offers = product.offers.map((offer) => {
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
    offers,
  };

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
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? undefined,
    datePublished: article.publishedAt ?? undefined,
    url: `${siteConfig.url}/gidsen/${article.slug}`,
    publisher: { "@type": "Organization", name: siteConfig.name },
  };
}
