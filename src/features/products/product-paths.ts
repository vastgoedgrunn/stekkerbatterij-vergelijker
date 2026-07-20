import type { Route } from "next";
import type { ProductType } from "./types";

/** URL-pad voor batterij-catalogi. Accessoires horen op `/shop`, niet hier. */
export function catalogBasePath(
  productType: Exclude<ProductType, "accessory">,
): "/stekkerbatterijen" | "/vaste-thuisbatterijen" {
  return productType === "fixed" ? "/vaste-thuisbatterijen" : "/stekkerbatterijen";
}

/** Typed App Router path voor productdetail. Accessoires landen op de shop. */
export function productDetailPath(slug: string, productType: ProductType): Route {
  if (productType === "accessory") {
    return "/shop" as Route;
  }
  return `${catalogBasePath(productType)}/${slug}` as Route;
}

export function productTypeLabel(productType: ProductType): string {
  if (productType === "fixed") return "Vaste thuisbatterij";
  if (productType === "accessory") return "Energie-accessoire";
  return "Stekkerbatterij";
}

export function productTypeBadge(productType: ProductType): string {
  if (productType === "fixed") return "Installatie vereist";
  if (productType === "accessory") return "Via bol";
  return "Plug & play";
}
