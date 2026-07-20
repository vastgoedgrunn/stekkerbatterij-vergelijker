import { permanentRedirect, notFound } from "next/navigation";
import type { Route } from "next";
import { getProductTypeBySlug, getProductSlugs } from "@/features/products/queries";
import { productDetailPath } from "@/features/products/product-paths";

export const revalidate = 3600;

export async function generateStaticParams() {
  const [plugIn, fixed] = await Promise.all([getProductSlugs("plug_in"), getProductSlugs("fixed")]);
  return [...plugIn, ...fixed].map((slug) => ({ slug }));
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
  if (productType === "accessory") {
    permanentRedirect("/shop" as Route);
  }
  permanentRedirect(productDetailPath(slug, productType));
}
