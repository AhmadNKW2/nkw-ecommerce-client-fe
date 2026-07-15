import { unstable_cache } from 'next/cache';
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

const getSeoSettingsServerCached = unstable_cache(
  async () => settingsService.getSeoSettings(),
  // Bump key when SEO payload shape changes so old Data Cache entries are not reused.
  ['seo-settings', 'v2-shipping-rules'],
  { revalidate: 30 },
);

export async function getSeoSettingsCached(): Promise<SeoSettings | null> {
  try {
    return await getSeoSettingsServerCached();
  } catch {
    return null;
  }
}