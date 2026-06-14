import type { SeoSettings } from "@/types/api.types";

export const DEFAULT_SITE_NAME_EN = "Storefront";
export const DEFAULT_SITE_NAME_AR = "المتجر الإلكتروني";

function pickFirstNonEmpty(...values: Array<string | null | undefined>) {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim();
}

export function resolveLocalizedSiteName(
  locale: string,
  seoSettings?: Pick<SeoSettings, "site_name_en" | "site_name_ar"> | null,
) {
  const fallbackName = locale === "ar" ? DEFAULT_SITE_NAME_AR : DEFAULT_SITE_NAME_EN;

  if (locale === "ar") {
    return pickFirstNonEmpty(
      seoSettings?.site_name_ar,
      seoSettings?.site_name_en,
      fallbackName,
    )!;
  }

  return pickFirstNonEmpty(
    seoSettings?.site_name_en,
    seoSettings?.site_name_ar,
    fallbackName,
  )!;
}
