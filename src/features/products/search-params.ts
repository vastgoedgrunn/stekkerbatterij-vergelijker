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

const schema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().min(1).max(100).optional()),
  merk: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  categorie: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  minCap: z.coerce.number().min(0).max(100).optional(),
  maxCap: z.coerce.number().min(0).max(100).optional(),
  minPrijs: z.coerce.number().min(0).max(100000).optional(),
  maxPrijs: z.coerce.number().min(0).max(100000).optional(),
  uitbreidbaar: z.string().optional(),
  sorteer: z.enum(sortValues).optional(),
  pagina: z.coerce.number().int().min(1).optional(),
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
