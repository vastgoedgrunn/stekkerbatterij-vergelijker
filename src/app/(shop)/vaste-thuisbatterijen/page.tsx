import type { Metadata } from "next";
import {
  CatalogByTypePage,
  catalogMetadata,
} from "@/features/products/components/catalog-by-type-page";

export const metadata: Metadata = catalogMetadata("fixed");

export default async function VasteThuisbatterijenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CatalogByTypePage productType="fixed" searchParams={searchParams} />;
}
