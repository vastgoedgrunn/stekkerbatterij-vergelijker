import type { ProductType } from "./types";

/** URL-pad voor productlijst of PDP op basis van product_type. */
export function catalogBasePath(productType: ProductType): "/stekkerbatterijen" | "/vaste-thuisbatterijen" {
  return productType === "fixed" ? "/vaste-thuisbatterijen" : "/stekkerbatterijen";
}

export function productDetailPath(slug: string, productType: ProductType): string {
  return `${catalogBasePath(productType)}/${slug}`;
}

export function productTypeLabel(productType: ProductType): string {
  return productType === "fixed" ? "Vaste thuisbatterij" : "Stekkerbatterij";
}

export function productTypeBadge(productType: ProductType): string {
  return productType === "fixed" ? "Installatie vereist" : "Plug & play";
}
