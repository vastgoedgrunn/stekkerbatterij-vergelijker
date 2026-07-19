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
 * Toont alleen een echte foto bij image_status=ok. Anders nette placeholder.
 * onError vangt 404's op oude paden.
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
        "from-accent/50 via-muted to-background relative overflow-hidden bg-gradient-to-br",
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
          className={cn("object-contain p-5", imgClassName)}
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
