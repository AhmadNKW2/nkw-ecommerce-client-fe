import { useQuery } from "@tanstack/react-query";

import { settingsService } from "@/services/settings.service";

export const PRODUCT_FIELD_TOGGLES_QUERY_KEY = ["product-field-toggles"] as const;

// Public endpoint — no auth required. The storefront reads this to hide
// disabled product fields (vendors, attributes, specifications, weight & dimensions).
// The 3 admin-appearance toggles are returned by the endpoint but ignored here.
export function useProductFieldToggles() {
  return useQuery({
    queryKey: PRODUCT_FIELD_TOGGLES_QUERY_KEY,
    queryFn: settingsService.getProductFieldToggles,
    staleTime: 5 * 60 * 1000,
    // Fail open: if the endpoint is unreachable, render every field (matches
    // the all-enabled contract) instead of breaking the product page.
    retry: 1,
  });
}

// Convenience helper for callers that want explicit booleans with safe defaults
// while the query is loading or has errored.
export function resolveProductFieldToggles(
  data: Awaited<ReturnType<typeof settingsService.getProductFieldToggles>> | undefined,
) {
  return {
    vendorsEnabled: data?.vendors_enabled ?? true,
    attributesEnabled: data?.attributes_enabled ?? true,
    specificationsEnabled: data?.specifications_enabled ?? true,
    weightAndDimensionsEnabled: data?.weight_and_dimensions_enabled ?? true,
  };
}
