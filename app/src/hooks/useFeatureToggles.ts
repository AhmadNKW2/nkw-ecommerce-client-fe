import { useQuery } from "@tanstack/react-query";

import { settingsService } from "@/services/settings.service";

export const FEATURE_TOGGLES_QUERY_KEY = ["feature-toggles"] as const;

/** @deprecated Use FEATURE_TOGGLES_QUERY_KEY */
export const PRODUCT_FIELD_TOGGLES_QUERY_KEY = FEATURE_TOGGLES_QUERY_KEY;

// Public endpoint — no auth required. The storefront reads this to hide
// disabled modules and product fields across the client site.
export function useFeatureToggles() {
  return useQuery({
    queryKey: FEATURE_TOGGLES_QUERY_KEY,
    queryFn: settingsService.getFeatureToggles,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/** @deprecated Use useFeatureToggles */
export const useProductFieldToggles = useFeatureToggles;

export function resolveFeatureToggles(
  data: Awaited<ReturnType<typeof settingsService.getFeatureToggles>> | undefined,
) {
  return {
    vendorsEnabled: data?.vendors_enabled ?? true,
    ratingsEnabled: data?.ratings_enabled ?? true,
    attributesEnabled: data?.attributes_enabled ?? true,
    specificationsEnabled: data?.specifications_enabled ?? true,
    weightAndDimensionsEnabled: data?.weight_and_dimensions_enabled ?? true,
    partnersEnabled: data?.partners_enabled ?? true,
    cashbackEnabled: data?.cashback_enabled ?? true,
    bannersEnabled: data?.banners_enabled ?? true,
    importAiProductsEnabled: data?.import_ai_products_enabled ?? true,
    // Linked products depend on vendors — hide when vendors are off.
    linkedProductsEnabled:
      (data?.vendors_enabled ?? true) && (data?.linked_products_enabled ?? true),
    productFilesEnabled: data?.product_files_enabled ?? true,
    easyPurchaseEnabled: data?.easy_purchase_enabled ?? false,
    cartSidebarButtonEnabled: data?.cart_sidebar_button_enabled ?? true,
  };
}

/** @deprecated Use resolveFeatureToggles */
export const resolveProductFieldToggles = resolveFeatureToggles;
