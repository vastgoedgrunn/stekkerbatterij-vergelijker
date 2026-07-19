"use client";

import { useState } from "react";
import Image from "next/image";
import { BatteryCharging } from "lucide-react";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import type { ProductImageStatus } from "@/lib/db/database.types";
import { cn } from "@/lib/utils";

type ProductImageProps = {
  name: string;
  imagePath: string | null;
  imageStatus?: ProductImageStatus | null;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

/**
 * Toont alleen een echte foto bij image_status=ok.
 * object-contain + vaste padding: product blijft volledig in de box (geen crop).
 */
export function ProductImage({
  name,
  imagePath,
  imageStatus,
  fill = true,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, 33vw",
  className,
  imgClassName,
  priority,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const url =
    imageStatus === "ok" || (imageStatus == null && Boolean(imagePath))
      ? getPublicImageUrl(imagePath)
      : null;
  const showImage = Boolean(url) && !failed;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[linear-gradient(160deg,#f4f6f5_0%,#eef1ef_55%,#f8f9f8_100%)]",
        className,
      )}
    >
      {showImage && url ? (
        <Image
          src={url}
          alt={name}
          fill={fill}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          sizes={sizes}
          priority={priority}
          className={cn("object-contain object-center p-4 sm:p-5", imgClassName)}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex h-full min-h-[8rem] w-full items-center justify-center">
          <BatteryCharging className="text-primary/25 size-16" aria-hidden />
          <span className="sr-only">Geen productfoto beschikbaar voor {name}</span>
        </span>
      )}
    </div>
  );
}
