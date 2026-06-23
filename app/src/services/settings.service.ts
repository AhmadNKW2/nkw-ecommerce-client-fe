import { apiClient } from '@/lib/api-client';
import type { ProductFieldToggles, SeoSettings } from '@/types/api.types';

export const settingsService = {
  getSeoSettings: async (): Promise<SeoSettings> => {
    return apiClient.get<SeoSettings>('/settings/seo');
  },
  // Public endpoint — no auth required. Used by the storefront to hide
  // disabled product fields (vendors, attributes, specifications, weight & dimensions).
  getProductFieldToggles: async (): Promise<ProductFieldToggles> => {
    return apiClient.get<ProductFieldToggles>('/settings/product-fields');
  },
};