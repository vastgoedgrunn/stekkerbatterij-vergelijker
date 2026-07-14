import { cn } from "@/lib/utils";

/** Compacte cijfer + label, voor vertrouwens-/USP-blokken. */
export function Stat({
  value,
  label,
  className,
}: {
  value: React.ReactNode;
  label: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-3xl font-bold tracking-tight sm:text-4xl">{value}</span>
      <span className="text-muted-foreground mt-1 text-sm">{label}</span>
    </div>
  );
}
