import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import {
  buildLanguageAlternates,
  getAbsoluteLocalizedUrl,
  normalizePathname,
} from "@/lib/seo/localized-path";

export const NOINDEX_ROBOTS = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
} as const;

export function resolveLocalizedSeoValue(
  locale: string,
  englishValue: string | null | undefined,
  arabicValue: string | null | undefined,
  fallbackValue: string,
): string {
  const normalizedEnglishValue = englishValue?.trim();
  const normalizedArabicValue = arabicValue?.trim();

  if (locale === "ar") {
    return normalizedArabicValue || normalizedEnglishValue || fallbackValue;
  }

  return normalizedEnglishValue || normalizedArabicValue || fallbackValue;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncateDescription(value: string, maxLength = 160): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

type BuildCatalogPageMetadataInput = {
  locale: string;
  pathnameWithoutLocale: string;
  title: string;
  description: string;
  image?: string | null;
  noindex?: boolean;
  openGraphType?: "website" | "article";
};

export function buildCatalogPageMetadata({
  locale,
  pathnameWithoutLocale,
  title,
  description,
  image,
  noindex = false,
  openGraphType = "website",
}: BuildCatalogPageMetadataInput): Metadata {
  const path = normalizePathname(pathnameWithoutLocale);
  const canonicalUrl = getAbsoluteLocalizedUrl(locale, path);
  const languages = buildLanguageAlternates(path);
  const cleanDescription = truncateDescription(stripHtml(description) || SITE_CONFIG.description);
  const ogImage = image?.trim() || SITE_CONFIG.ogImage;

  return {
    title,
    description: cleanDescription,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      type: openGraphType,
      locale: locale === "ar" ? "ar_JO" : "en_US",
      url: canonicalUrl,
      title,
      description: cleanDescription,
      siteName: SITE_CONFIG.name,
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: cleanDescription,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: noindex ? NOINDEX_ROBOTS : undefined,
  };
}

export function buildNoIndexMetadata(title?: string): Metadata {
  return {
    ...(title ? { title } : {}),
    robots: NOINDEX_ROBOTS,
  };
}
