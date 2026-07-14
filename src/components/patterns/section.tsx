import * as React from "react";
import { cn } from "@/lib/utils";

/** Vaste, gecentreerde inhoudsbreedte. */
export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)} {...props} />;
}

/** Verticaal ritme voor pagina-secties. */
export function Section({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("py-14 sm:py-20", className)} {...props}>
      {children}
    </section>
  );
}

/** Kleine bovenkop (eyebrow) boven een sectietitel. */
export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-primary inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {description && (
        <p
          className={cn(
            "text-muted-foreground text-lg text-pretty",
            align === "center" && "max-w-2xl",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
