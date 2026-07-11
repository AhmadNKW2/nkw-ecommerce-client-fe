import type { SeoSettings } from "@/types/api.types";

const DEFAULT_SUPPORT_EMAIL = "help@ordonsooq.com";

export function resolveSupportEmail(
  seoSettings?: Pick<SeoSettings, "support_email"> | null,
): string {
  const email = seoSettings?.support_email?.trim();
  return email || DEFAULT_SUPPORT_EMAIL;
}

export function resolveSocialLinks(
  seoSettings?: Pick<
    SeoSettings,
    "facebook_url" | "twitter_url" | "instagram_url"
  > | null,
) {
  return {
    facebook: seoSettings?.facebook_url?.trim() || "",
    twitter: seoSettings?.twitter_url?.trim() || "",
    instagram: seoSettings?.instagram_url?.trim() || "",
  };
}
