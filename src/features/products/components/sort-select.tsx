"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";

const options: { value: string; label: string }[] = [
  { value: "relevance", label: "Relevantie" },
  { value: "price_asc", label: "Prijs (laag → hoog)" },
  { value: "price_desc", label: "Prijs (hoog → laag)" },
  { value: "capacity_desc", label: "Capaciteit (hoog → laag)" },
  { value: "rating_desc", label: "Best beoordeeld" },
];

export function SortSelect({ current }: { current: string }) {
  const router = useRouter();
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
          router.push(`/batterijen?${params.toString()}`);
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
