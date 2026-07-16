"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";

const options: { value: string; label: string }[] = [
  { value: "relevance", label: "Relevantie" },
  { value: "price_asc", label: "Prijs (laag → hoog)" },
  { value: "price_desc", label: "Prijs (hoog → laag)" },
  { value: "value_asc", label: "Prijs per kWh (laag → hoog)" },
  { value: "capacity_desc", label: "Capaciteit (hoog → laag)" },
  { value: "rating_desc", label: "Best beoordeeld" },
];

export function SortSelect({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground whitespace-nowrap">Sorteer op</span>
      <Select
        defaultValue={current}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("sorteer", e.target.value);
          params.delete("pagina");
          router.push(`${pathname}?${params.toString()}` as Route);
        }}
        className="w-full sm:w-52"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </label>
  );
}
