import Image from "next/image";
import Link from "next/link";
import { BatteryCharging, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/patterns/rating-stars";
import { CompareToggle } from "@/features/comparison/compare-toggle";
import { formatNumber, formatPrice } from "@/lib/format";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import type { ProductListItem } from "@/features/products/types";

export function ProductCard({ product }: { product: ProductListItem }) {
  const imageUrl = getPublicImageUrl(product.imagePath);

  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link
        href={`/batterijen/${product.slug}`}
        className="focus-visible:ring-ring bg-muted relative flex aspect-4/3 items-center justify-center focus-visible:ring-2 focus-visible:outline-none"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-contain p-4"
          />
        ) : (
          <BatteryCharging className="text-muted-foreground/40 size-16" aria-hidden />
        )}
        {product.expandable && (
          <Badge variant="secondary" className="absolute top-3 left-3">
            Uitbreidbaar
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {product.brand.name}
            </p>
            <h3 className="leading-tight font-semibold">
              <Link
                href={`/batterijen/${product.slug}`}
                className="after:absolute after:inset-0 hover:underline"
              >
                {product.name}
              </Link>
            </h3>
          </div>
          <CompareToggle slug={product.slug} className="relative z-10" />
        </div>

        <RatingStars average={product.rating.average} count={product.rating.count} />

        <dl className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {product.capacityKwh !== null && (
            <div className="flex items-center gap-1">
              <BatteryCharging className="size-4" aria-hidden />
              <dt className="sr-only">Capaciteit</dt>
              <dd>{formatNumber(product.capacityKwh)} kWh</dd>
            </div>
          )}
          {product.powerKw !== null && (
            <div className="flex items-center gap-1">
              <Zap className="size-4" aria-hidden />
              <dt className="sr-only">Vermogen</dt>
              <dd>{formatNumber(product.powerKw)} kW</dd>
            </div>
          )}
        </dl>

        <div className="mt-auto pt-2">
          {product.lowestPriceCents !== null ? (
            <p className="text-sm">
              <span className="text-muted-foreground">vanaf </span>
              <span className="text-lg font-bold">{formatPrice(product.lowestPriceCents)}</span>
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">Prijs volgt</p>
          )}
        </div>
      </div>
    </Card>
  );
}
