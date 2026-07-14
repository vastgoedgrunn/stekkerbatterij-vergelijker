import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BatteryCharging, Clock, ShieldCheck, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/patterns/rating-stars";
import { CompareToggle } from "@/features/comparison/compare-toggle";
import { formatNumber, formatPrice } from "@/lib/format";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import type { ProductListItem } from "@/features/products/types";

export function ProductCard({ product }: { product: ProductListItem }) {
  const imageUrl = getPublicImageUrl(product.imagePath);

  const specs = [
    product.capacityKwh !== null && {
      icon: BatteryCharging,
      label: `${formatNumber(product.capacityKwh)} kWh`,
    },
    product.powerKw !== null && { icon: Zap, label: `${formatNumber(product.powerKw)} kW` },
    product.warrantyYears !== null && {
      icon: ShieldCheck,
      label: `${product.warrantyYears} jr garantie`,
    },
    product.cycles !== null && {
      icon: Clock,
      label: `${formatNumber(product.cycles)} cycli`,
    },
  ].filter(Boolean) as { icon: typeof Zap; label: string }[];

  return (
    <Card interactive className="group relative flex h-full flex-col overflow-hidden">
      <div className="from-accent/60 via-muted to-background relative aspect-[4/3] overflow-hidden bg-gradient-to-br">
        <Link
          href={`/batterijen/${product.slug}`}
          className="flex h-full w-full items-center justify-center focus-visible:outline-none"
          aria-label={product.name}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <BatteryCharging className="text-primary/25 size-20" aria-hidden />
          )}
        </Link>

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.expandable && <Badge variant="highlight">Uitbreidbaar</Badge>}
        </div>
        <div className="absolute top-3 right-3">
          <CompareToggle slug={product.slug} className="relative z-10" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {product.brand.name}
          </p>
          <h3 className="mt-0.5 leading-tight font-semibold">
            <Link
              href={`/batterijen/${product.slug}`}
              className="group-hover:text-primary transition-colors after:absolute after:inset-0"
            >
              {product.name}
            </Link>
          </h3>
        </div>

        <RatingStars average={product.rating.average} count={product.rating.count} />

        <ul className="flex flex-wrap gap-1.5">
          {specs.map((spec) => (
            <li
              key={spec.label}
              className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium"
            >
              <spec.icon className="size-3.5" aria-hidden />
              {spec.label}
            </li>
          ))}
        </ul>

        <div className="border-border/70 mt-auto flex items-end justify-between border-t pt-4">
          <div>
            {product.lowestPriceCents !== null ? (
              <>
                <span className="text-muted-foreground block text-xs">vanaf</span>
                <span className="text-xl font-bold tracking-tight">
                  {formatPrice(product.lowestPriceCents)}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">Prijs volgt</span>
            )}
          </div>
          <span className="text-primary relative z-10 inline-flex items-center gap-1 text-sm font-semibold">
            Bekijken
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Card>
  );
}
