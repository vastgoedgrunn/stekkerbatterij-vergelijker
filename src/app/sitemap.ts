import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getBrands, getProductSlugs } from "@/features/products/queries";
import { getArticleSlugs } from "@/features/content/queries";
import { productDetailPath } from "@/features/products/product-paths";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/batterijen`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    {
      url: `${base}/stekkerbatterijen`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/vaste-thuisbatterijen`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    { url: `${base}/merken`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    {
      url: `${base}/beste-stekkerbatterij`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/beste-vaste-thuisbatterij`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    { url: `${base}/beslishulp`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/gidsen`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    {
      url: `${base}/tools/terugverdientijd`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${base}/energie`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/over-ons`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    {
      url: `${base}/over-ons/hoe-wij-vergelijken`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    { url: `${base}/garantie`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacybeleid`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    {
      url: `${base}/algemene-voorwaarden`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${base}/herroepingsrecht`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const [plugInSlugs, fixedSlugs, articleSlugs, brands] = await Promise.all([
    getProductSlugs("plug_in"),
    getProductSlugs("fixed"),
    getArticleSlugs(),
    getBrands(),
  ]);

  const productRoutes: MetadataRoute.Sitemap = [
    ...plugInSlugs.map((slug) => ({
      url: `${base}${productDetailPath(slug, "plug_in")}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...fixedSlugs.map((slug) => ({
      url: `${base}${productDetailPath(slug, "fixed")}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  const brandRoutes: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${base}/merken/${brand.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articleSlugs.map((slug) => ({
    url: `${base}/gidsen/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...brandRoutes, ...productRoutes, ...articleRoutes];
}
