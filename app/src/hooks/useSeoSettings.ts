import { useQuery } from "@tanstack/react-query";

import { settingsService } from "@/services/settings.service";

export const SEO_SETTINGS_QUERY_KEY = ["seo-settings"] as const;

export function useSeoSettings() {
  return useQuery({
    queryKey: SEO_SETTINGS_QUERY_KEY,
    queryFn: settingsService.getSeoSettings,
    // Shipping countdown depends on fresh rules; avoid sticky hydrated/stale SEO payloads.
    staleTime: 30_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}
