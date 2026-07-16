import type { Route } from "next";
import type { ProductType } from "./types";

/** URL-pad voor productlijst of PDP op basis van product_type. */
export function catalogBasePath(
  productType: ProductType,
): "/stekkerbatterijen" | "/vaste-thuisbatterijen" {
  return productType === "fixed" ? "/vaste-thuisbatterijen" : "/stekkerbatterijen";
}

/** Typed App Router path voor productdetail. */
export function productDetailPath(slug: string, productType: ProductType): Route {
  return `${catalogBasePath(productType)}/${slug}` as Route;
}

export function productTypeLabel(productType: ProductType): string {
  return productType === "fixed" ? "Vaste thuisbatterij" : "Stekkerbatterij";
}

export function productTypeBadge(productType: ProductType): string {
  return productType === "fixed" ? "Installatie vereist" : "Plug & play";
}
