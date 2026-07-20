import { z } from "zod";
import type { ProductFilters, ProductSort } from "./types";

const sortValues: [ProductSort, ...ProductSort[]] = [
  "relevance",
  "price_asc",
  "price_desc",
  "value_asc",
  "capacity_desc",
  "rating_desc",
];

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

/**
 * Lege number-inputs komen binnen als "" en `z.coerce.number()` maakt daar 0 van.
 * Dat zet per ongeluk maxCap/maxPrijs op 0 en levert 0 resultaten.
 * Ongeldige waarden → undefined (niet de hele filterparse laten falen).
 */
function optionalNumber(max: number, opts?: { int?: boolean; min?: number }) {
  const min = opts?.min ?? 0;
  return z.preprocess((value) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === "string" && value.trim() === "") return undefined;
    const raw = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(raw)) return undefined;
    const n = opts?.int ? Math.trunc(raw) : raw;
    if (n < min || n > max) return undefined;
    return n;
  }, z.number().optional());
}

const schema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().min(1).max(100).optional()),
  merk: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  categorie: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  minCap: optionalNumber(100),
  maxCap: optionalNumber(100),
  minPrijs: optionalNumber(100_000),
  maxPrijs: optionalNumber(100_000),
  uitbreidbaar: z.string().optional(),
  sorteer: z.enum(sortValues).optional(),
  pagina: optionalNumber(10_000, { int: true, min: 1 }),
});

type RawSearchParams = Record<string, string | string[] | undefined>;

export function parseProductFilters(params: RawSearchParams): ProductFilters {
  const single: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    single[key] = Array.isArray(value) ? value[0] : value;
  }

  const result = schema.safeParse(single);
  if (!result.success) return {};

  const data = result.data;
  return {
    search: data.q,
    brandSlug: data.merk,
    categorySlug: data.categorie,
    minCapacity: data.minCap,
    maxCapacity: data.maxCap,
    minPrice: data.minPrijs,
    maxPrice: data.maxPrijs,
    expandableOnly: data.uitbreidbaar === "1" || data.uitbreidbaar === "true",
    sort: data.sorteer,
    page: data.pagina,
  };
}
