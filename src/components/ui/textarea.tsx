import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "border-input bg-background flex min-h-24 w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors",
        "placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-ring/40 focus-visible:ring-4 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
