import { formatNumber } from "@/lib/format";
import type { ProductDetail, ProductSpec } from "@/features/products/types";

function buildCoreSpecs(product: ProductDetail): ProductSpec[] {
  const specs: ProductSpec[] = [];
  if (product.capacityKwh !== null)
    specs.push({
      key: "capacity",
      label: "Capaciteit",
      unit: "kWh",
      value: `${formatNumber(product.capacityKwh)} kWh`,
    });
  if (product.powerKw !== null)
    specs.push({
      key: "power",
      label: "Vermogen",
      unit: "kW",
      value: `${formatNumber(product.powerKw)} kW`,
    });
  if (product.cycles !== null)
    specs.push({
      key: "cycles",
      label: "Levensduur",
      unit: "cycli",
      value: `${formatNumber(product.cycles)} cycli`,
    });
  if (product.warrantyYears !== null)
    specs.push({
      key: "warranty",
      label: "Garantie",
      unit: "jaar",
      value: `${product.warrantyYears} jaar`,
    });
  specs.push({
    key: "expandable",
    label: "Uitbreidbaar",
    unit: null,
    value: product.expandable ? "Ja" : "Nee",
  });
  return specs;
}

export function SpecList({ product }: { product: ProductDetail }) {
  const specs = [...buildCoreSpecs(product), ...product.specs];

  return (
    <dl className="border-border bg-card grid grid-cols-1 overflow-hidden rounded-2xl border sm:grid-cols-2">
      {specs.map((spec) => (
        <div
          key={spec.key}
          className="border-border/70 flex items-center justify-between gap-4 border-b px-5 py-3.5"
        >
          <dt className="text-muted-foreground text-sm">{spec.label}</dt>
          <dd className="text-right text-sm font-semibold">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}
