import { apiClient } from '@/lib/api-client';
import type { FeatureToggles, SeoSettings, SitePopupSettings } from '@/types/api.types';

export const settingsService = {
  getSeoSettings: async (): Promise<SeoSettings> => {
    return apiClient.get<SeoSettings>('/settings/seo');
  },
  getFeatureToggles: async (): Promise<FeatureToggles> => {
    return apiClient.get<FeatureToggles>('/settings/features');
  },
  getSitePopupSettings: async (): Promise<SitePopupSettings> => {
    return apiClient.get<SitePopupSettings>('/settings/popup');
  },

  /** @deprecated Use getFeatureToggles */
  getProductFieldToggles: async (): Promise<FeatureToggles> => {
    return settingsService.getFeatureToggles();
  },
};