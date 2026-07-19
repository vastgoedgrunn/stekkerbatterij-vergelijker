import type { ReactNode } from "react";
import Image from "next/image";
import { BatteryCharging } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductImageProps = {
  src: string | null;
  alt: string;
  /** Catalog cards use 4:3; PDP uses square. */
  aspect?: "square" | "card";
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Extra classes on the Next Image (hover scale etc.). */
  imageClassName?: string;
  children?: ReactNode;
};

/**
 * Studio-style product frame: white stage, consistent padding, soft edge.
 * Matches catalog cutouts (Gaslicht-achtig) without brand-kopie van hun UI.
 */
export function ProductImage({
  src,
  alt,
  aspect = "card",
  sizes,
  priority = false,
  className,
  imageClassName,
  children,
}: ProductImageProps) {
  return (
    <div
      className={cn(
        "border-border/60 relative overflow-hidden border bg-white",
        aspect === "square" ? "aspect-square rounded-3xl" : "aspect-[4/3]",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn("object-contain p-5 sm:p-6", imageClassName)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-zinc-50">
          <BatteryCharging className="text-primary/25 size-20" aria-hidden />
        </span>
      )}
      {children}
    </div>
  );
}
