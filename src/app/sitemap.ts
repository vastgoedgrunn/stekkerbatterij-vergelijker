import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getProductSlugs } from "@/features/products/queries";
import { getArticleSlugs } from "@/features/content/queries";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/batterijen`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/beslishulp`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/gidsen`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/over-ons`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const [productSlugs, articleSlugs] = await Promise.all([getProductSlugs(), getArticleSlugs()]);

  const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${base}/batterijen/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articleSlugs.map((slug) => ({
    url: `${base}/gidsen/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...articleRoutes];
}
