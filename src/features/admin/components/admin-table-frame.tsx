import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Scrollbare tabelcontainer die op smalle schermen niet uit de viewport loopt. */
export function AdminTableFrame({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      {title ? <h2 className="mb-3 text-base font-semibold sm:text-lg">{title}</h2> : null}
      <div className="border-border bg-card overflow-hidden rounded-xl border sm:rounded-2xl">
        <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          {children}
        </div>
      </div>
    </div>
  );
}
