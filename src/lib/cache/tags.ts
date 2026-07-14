/**
 * Centrale cache-tags. Voorkomt magic strings en houdt invalidatie
 * consistent tussen queries (die taggen) en mutaties (die reval­ideren).
 *
 * Next.js 16: `revalidateTag(tag, profile)` vereist een cacheLife-profiel;
 * gebruik `updateTag(tag)` in Server Actions voor read-your-writes.
 */
export const cacheTags = {
  products: () => "products",
  product: (id: string) => `product:${id}`,
  productBySlug: (slug: string) => `product-slug:${slug}`,
  category: (id: string) => `category:${id}`,
  offersForProduct: (productId: string) => `offers:${productId}`,
  reviewsForProduct: (productId: string) => `reviews:${productId}`,
  content: (slug: string) => `content:${slug}`,
  contentList: () => "content",
} as const;

export type CacheTag = ReturnType<(typeof cacheTags)[keyof typeof cacheTags]>;
