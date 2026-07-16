import type { Metadata } from "next";
import {
  CatalogByTypePage,
  catalogMetadata,
} from "@/features/products/components/catalog-by-type-page";

export const metadata: Metadata = catalogMetadata("plug_in");

export default async function StekkerbatterijenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CatalogByTypePage productType="plug_in" searchParams={searchParams} />;
}
