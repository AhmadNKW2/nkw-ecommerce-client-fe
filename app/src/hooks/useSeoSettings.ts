import { useQuery } from "@tanstack/react-query";

import { settingsService } from "@/services/settings.service";

export const SEO_SETTINGS_QUERY_KEY = ["seo-settings"] as const;

export function useSeoSettings() {
  return useQuery({
    queryKey: SEO_SETTINGS_QUERY_KEY,
    queryFn: settingsService.getSeoSettings,
    staleTime: 5 * 60 * 1000,
  });
}
