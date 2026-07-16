import type { Route } from "next";
import { permanentRedirect, notFound } from "next/navigation";
import { getProductTypeBySlug, getProductSlugs } from "@/features/products/queries";
import { productDetailPath } from "@/features/products/product-paths";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

/** Legacy URL: 301 naar type-correct pad. */
export default async function LegacyProductRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const productType = await getProductTypeBySlug(slug);
  if (!productType) notFound();
  permanentRedirect(productDetailPath(slug, productType) as Route);
}
