import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "border-input bg-background flex h-11 w-full rounded-xl border px-3.5 py-2 text-sm transition-colors",
        "placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-ring/40 focus-visible:ring-4 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
