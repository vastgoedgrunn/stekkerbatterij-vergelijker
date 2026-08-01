"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/observability/analytics";

export function CatalogProductLink({
  href,
  productId,
  productSlug,
  trackFixedCatalogClick,
  className,
  children,
}: {
  href: string;
  productId: string;
  productSlug: string;
  trackFixedCatalogClick: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        if (!trackFixedCatalogClick) return;
        trackEvent({
          name: "fixed_catalog_product_clicked",
          props: {
            productId,
            slug: productSlug,
            placement: "product_card",
          },
        });
      }}
    >
      {children}
    </Link>
  );
}
