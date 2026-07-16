import type { ProductFilters } from "@/types/api.types";
import type { SearchFilters, SortOption } from "./types";

export type SearchFilterState = {
  q?: string;
  category_ids?: string;
  brand_ids?: string;
  vendor_ids?: string;
  attributes_values_ids?: string;
  specifications_values_ids?: string;
  min_price?: number;
  max_price?: number;
  average_rating_min?: number;
  sort_by?: SortOption;
  page?: number;
};

type SearchParamsInput = Record<string, string | string[] | undefined>;

function firstString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function finiteNumber(value: string | string[] | undefined): number | undefined {
  const rawValue = firstString(value);

  if (!rawValue) {
    return undefined;
  }

  const numericValue = Number(rawValue);
  return Number.isFinite(numericValue) ? numericValue : undefined;
}

export function splitFilterValues(value?: string): string[] {
  return value
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean) ?? [];
}

export function joinFilterValues(values: string[]): string | null {
  const normalizedValues = values.map((value) => value.trim()).filter(Boolean);
  return normalizedValues.length > 0 ? normalizedValues.join(",") : null;
}

function firstNumericFilterValue(value?: string): number | undefined {
  const firstValue = splitFilterValues(value)[0];
  if (!firstValue) return undefined;

  const numericValue = Number(firstValue);
  return Number.isFinite(numericValue) ? numericValue : undefined;
}

export function searchParamsToSearchFilters(params: SearchParamsInput): SearchFilterState {
  return {
    q: firstString(params.q),
    category_ids: firstString(params.category_ids),
    brand_ids: firstString(params.brand_ids) ?? firstString(params.brand_id),
    vendor_ids: firstString(params.vendor_ids) ?? firstString(params.vendor_id),
    attributes_values_ids: firstString(params.attributes_values_ids),
    specifications_values_ids: firstString(params.specifications_values_ids),
    min_price: finiteNumber(params.min_price),
    max_price: finiteNumber(params.max_price),
    average_rating_min: finiteNumber(params.average_rating_min),
    sort_by: firstString(params.sort_by) as SortOption | undefined,
    page: finiteNumber(params.page) ?? 1,
  };
}

/** Compare search filter snapshots from SSR props vs client URL state. */
export function areSearchFiltersEquivalent(
  left: Omit<SearchFilterState, "page">,
  right: Omit<SearchFilterState, "page">,
): boolean {
  const keys: Array<keyof Omit<SearchFilterState, "page">> = [
    "q",
    "category_ids",
    "brand_ids",
    "vendor_ids",
    "attributes_values_ids",
    "specifications_values_ids",
    "min_price",
    "max_price",
    "average_rating_min",
    "sort_by",
  ];

  return keys.every((key) => (left[key] ?? undefined) === (right[key] ?? undefined));
}

/** Stable string key for search filter snapshots (query keys / effect deps). */
export function serializeSearchFilterSnapshot(
  filters: Partial<Omit<SearchFilters, "page">> & { per_page?: number },
): string {
  return JSON.stringify({
    q: filters.q ?? null,
    category_ids: filters.category_ids ?? null,
    brand_ids: filters.brand_ids ?? null,
    vendor_ids: filters.vendor_ids ?? null,
    attributes_values_ids: filters.attributes_values_ids ?? null,
    specifications_values_ids: filters.specifications_values_ids ?? null,
    min_price: filters.min_price ?? null,
    max_price: filters.max_price ?? null,
    average_rating_min: filters.average_rating_min ?? null,
    sort_by: filters.sort_by ?? null,
    per_page: filters.per_page ?? null,
  });
}

export function searchFiltersToApiFilters(filters: SearchFilterState, limit = 24): ProductFilters {
  const sortParts = filters.sort_by ? filters.sort_by.split(":") : ["average_rating", "desc"];
  let sortBy = sortParts[0];

  if (sortBy === "popularity_score") sortBy = "average_rating";
  if (sortBy === "rating") sortBy = "average_rating";

  return {
    page: filters.page,
    limit,
    sortBy: sortBy as ProductFilters["sortBy"],
    sortOrder: (sortParts[1] || "DESC").toUpperCase() as ProductFilters["sortOrder"],
    categoryId: firstNumericFilterValue(filters.category_ids),
    brandId: firstNumericFilterValue(filters.brand_ids),
    vendorId: firstNumericFilterValue(filters.vendor_ids),
    minPrice: filters.min_price,
    maxPrice: filters.max_price,
    minRating: filters.average_rating_min,
    search: filters.q && filters.q !== "*" ? filters.q : undefined,
  };
}
