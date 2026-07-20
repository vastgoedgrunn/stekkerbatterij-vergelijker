import type { Route } from "next";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FilterSearchInput } from "@/features/products/components/filter-search-input";
import type { Brand, Category, ProductFilters } from "@/features/products/types";

interface Props {
  brands: Brand[];
  categories: Category[];
  filters: ProductFilters;
  /** Form action path, default /batterijen hub catalog. */
  action?: Route;
}

export function ProductFilterPanel({ brands, categories, filters, action = "/batterijen" }: Props) {
  return (
    <form
      method="get"
      action={action}
      className="border-border bg-card rounded-2xl border p-5 shadow-[var(--shadow-xs)]"
    >
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="text-primary size-4" />
        <h2 className="font-semibold">Filters</h2>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="q">Zoeken</Label>
          <FilterSearchInput
            id="q"
            name="q"
            defaultValue={filters.search ?? ""}
            placeholder="Merk of model"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="merk">Merk</Label>
          <Select
            id="merk"
            name="merk"
            defaultValue={filters.brandSlug ?? ""}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
          >
            <option value="">Alle merken</option>
            {brands.map((b) => (
              <option key={b.id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="categorie">Categorie</Label>
          <Select
            id="categorie"
            name="categorie"
            defaultValue={filters.categorySlug ?? ""}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
          >
            <option value="">Alle categorieën</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">Capaciteit (kWh)</legend>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              name="minCap"
              min={0}
              step="0.1"
              defaultValue={filters.minCapacity ?? ""}
              placeholder="min"
              aria-label="Minimale capaciteit"
            />
            <span className="text-muted-foreground">tot</span>
            <Input
              type="number"
              name="maxCap"
              min={0}
              step="0.1"
              defaultValue={filters.maxCapacity ?? ""}
              placeholder="max"
              aria-label="Maximale capaciteit"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">Prijs (€)</legend>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              name="minPrijs"
              min={0}
              step="10"
              defaultValue={filters.minPrice ?? ""}
              placeholder="min"
              aria-label="Minimale prijs"
            />
            <span className="text-muted-foreground">tot</span>
            <Input
              type="number"
              name="maxPrijs"
              min={0}
              step="10"
              defaultValue={filters.maxPrice ?? ""}
              placeholder="max"
              aria-label="Maximale prijs"
            />
          </div>
        </fieldset>

        <label className="border-border hover:bg-accent flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm font-medium transition-colors">
          <input
            type="checkbox"
            name="uitbreidbaar"
            value="1"
            defaultChecked={filters.expandableOnly}
            className="accent-primary size-4 rounded"
          />
          Alleen uitbreidbaar
        </label>

        <input type="hidden" name="sorteer" value={filters.sort ?? "relevance"} />

        <div className="flex flex-col gap-2 pt-1">
          <Button type="submit">Filter toepassen</Button>
          <Link
            href={action}
            className="text-muted-foreground hover:text-foreground text-center text-sm"
          >
            Filters wissen
          </Link>
        </div>
      </div>
    </form>
  );
}
