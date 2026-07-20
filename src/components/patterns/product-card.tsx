import Link from "next/link";
import { ArrowRight, BatteryCharging, Clock, ShieldCheck, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/patterns/product-image";
import { ProductRatingDisplay } from "@/components/patterns/product-rating-display";
import { CompareToggle } from "@/features/comparison/compare-toggle";
import { OfferLink } from "@/features/offers-pricing/offer-link";
import { formatNumber, formatPrice } from "@/lib/format";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import type { ProductListItem } from "@/features/products/types";
import { productDetailPath, productTypeBadge } from "@/features/products/product-paths";
import { EDITORS_FAVORITE_PLUG_IN_SLUG } from "@/config/editors-picks";

export function ProductCard({ product }: { product: ProductListItem }) {
  const imageUrl = getPublicImageUrl(product.imagePath);
  const isFixed = product.productType === "fixed";
  const isAccessory = product.productType === "accessory";
  const isEditorsFavorite = product.slug === EDITORS_FAVORITE_PLUG_IN_SLUG;
  const outboundOffer = !isFixed && product.bestOffer?.id ? product.bestOffer : null;
  const href = productDetailPath(product.slug, product.productType);

  const pricePerKwh =
    !isFixed &&
    !isAccessory &&
    product.lowestPriceCents !== null &&
    product.capacityKwh &&
    product.capacityKwh > 0
      ? Math.round(product.lowestPriceCents / product.capacityKwh)
      : null;

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

  const indicativeLabel =
    product.indicativePriceMinCents != null
      ? product.indicativePriceMaxCents != null &&
        product.indicativePriceMaxCents !== product.indicativePriceMinCents
        ? `${formatPrice(product.indicativePriceMinCents)} tot ${formatPrice(product.indicativePriceMaxCents)}`
        : `vanaf ${formatPrice(product.indicativePriceMinCents)}`
      : null;

  return (
    <Card interactive className="group relative flex h-full flex-col overflow-hidden">
      {!isAccessory && (
        <div className="absolute top-3 right-3 z-20">
          <CompareToggle slug={product.slug} name={product.name} />
        </div>
      )}

      <Link
        href={href}
        className="focus-visible:ring-ring flex flex-1 flex-col rounded-[inherit] focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
      >
        <ProductImage
          src={imageUrl}
          alt={product.name}
          aspect="card"
          sizes="(max-width: 768px) 100vw, 33vw"
          imageClassName="transition-transform duration-300 group-hover:scale-[1.02]"
        >
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {isEditorsFavorite && <Badge variant="highlight">Beste koop</Badge>}
            <Badge variant={isFixed ? "muted" : "highlight"}>
              {productTypeBadge(product.productType)}
            </Badge>
            {product.expandable && <Badge variant="highlight">Uitbreidbaar</Badge>}
          </div>
        </ProductImage>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              {product.brand.name}
            </p>
            <h3 className="group-hover:text-primary mt-0.5 leading-tight font-semibold transition-colors">
              {product.name}
            </h3>
          </div>

          <ProductRatingDisplay
            rating={product.rating}
            marketScore={product.marketScore}
            showSource={false}
            compact
          />

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

          <div className="border-border/70 mt-auto space-y-3 border-t pt-4">
            {isFixed ? (
              <div>
                <span className="text-muted-foreground block text-xs">
                  {indicativeLabel ? "Richtprijs incl. installatie" : "Installatie via offerte"}
                </span>
                <span className="text-2xl font-bold tracking-tight">
                  {indicativeLabel ?? "Offerte op maat"}
                </span>
                {indicativeLabel && (
                  <span className="text-muted-foreground block text-xs">
                    Definitieve prijs via offerte op maat
                  </span>
                )}
              </div>
            ) : product.lowestPriceCents !== null ? (
              <div className="flex items-end justify-between gap-3">
                <div>
                  <span className="text-muted-foreground block text-xs">
                    vanaf · {product.offerCount}{" "}
                    {product.offerCount === 1 ? "aanbieder" : "aanbieders"}
                  </span>
                  <span className="text-2xl font-bold tracking-tight">
                    {formatPrice(product.lowestPriceCents)}
                  </span>
                </div>
                {pricePerKwh !== null && (
                  <span className="text-muted-foreground text-right text-xs leading-tight">
                    <span className="text-foreground block font-semibold">
                      {formatPrice(pricePerKwh)}
                    </span>
                    per kWh
                  </span>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground block text-sm">Prijs volgt</span>
            )}

            {!isFixed && outboundOffer && (
              <p className="text-muted-foreground text-xs">
                Laagste prijs bij{" "}
                <span className="text-foreground font-medium">{outboundOffer.merchantName}</span>
              </p>
            )}

            <span className="border-primary/30 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex w-full items-center justify-center gap-1.5 rounded-md border px-4 py-2 text-sm font-semibold transition-colors">
              {isFixed
                ? "Offerte aanvragen"
                : outboundOffer
                  ? `Details · vanaf ${formatPrice(outboundOffer.priceCents)}`
                  : "Bekijk details"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>

      {outboundOffer && (
        <div className="relative z-10 space-y-2 px-5 pb-5">
          <OfferLink
            offerId={outboundOffer.id}
            productId={product.id}
            merchant={outboundOffer.merchantName}
            sponsored={outboundOffer.isSponsored}
            estimatedCommissionCents={outboundOffer.estimatedCommissionCents}
            placement="catalog_card"
            size="sm"
            className="w-full"
          >
            Bekijk aanbieding
          </OfferLink>
          {outboundOffer.isSponsored ? (
            <p className="text-muted-foreground text-center text-[11px]">Advertentie</p>
          ) : null}
        </div>
      )}
    </Card>
  );
}
