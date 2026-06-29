import { apiClient } from '@/lib/api-client';
import type { FeatureToggles, SeoSettings } from '@/types/api.types';

export const settingsService = {
  getSeoSettings: async (): Promise<SeoSettings> => {
    return apiClient.get<SeoSettings>('/settings/seo');
  },
  // Public endpoint — no auth required. Used by the storefront to hide
  // disabled product fields (vendors, attributes, specifications, weight & dimensions).
  getFeatureToggles: async (): Promise<FeatureToggles> => {
    return apiClient.get<FeatureToggles>('/settings/features');
  },

  /** @deprecated Use getFeatureToggles */
  getProductFieldToggles: async (): Promise<FeatureToggles> => {
    return settingsService.getFeatureToggles();
  },
};