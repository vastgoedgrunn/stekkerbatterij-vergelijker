"use client";

import Image from "next/image";
import { useState } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type GuideCoverProps = {
  src: string | null;
  alt?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  fallbackIconClassName?: string;
};

/**
 * Cover met graceful fallback: ontbrekende of 404-afbeeldingen tonen een icoon
 * in plaats van een kapotte img.
 */
export function GuideCover({
  src,
  alt = "",
  sizes,
  priority = false,
  className,
  imageClassName,
  fallbackIconClassName,
}: GuideCoverProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div className={cn("bg-muted relative overflow-hidden", className)}>
      {showImage ? (
        <Image
          src={src!}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn("object-cover", imageClassName)}
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className={cn(
            "text-primary/25 flex h-full items-center justify-center",
            fallbackIconClassName,
          )}
        >
          <BookOpen className="size-12" aria-hidden />
        </span>
      )}
    </div>
  );
}
