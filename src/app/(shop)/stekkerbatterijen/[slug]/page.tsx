import type { Metadata } from "next";
import {
  ProductDetailByTypePage,
  productDetailGenerateMetadata,
  productDetailGenerateStaticParams,
} from "@/features/products/components/product-detail-by-type-page";

export const revalidate = 3600;

export async function generateStaticParams() {
  return productDetailGenerateStaticParams("plug_in");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return productDetailGenerateMetadata(slug, "plug_in");
}

export default async function StekkerbatterijDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductDetailByTypePage slug={slug} expectedType="plug_in" />;
}
