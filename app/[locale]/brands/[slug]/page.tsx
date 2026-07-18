import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { serverSearch } from "@/lib/search/api";
import { EntitySlugPageClient } from "@/components/layout/entity-slug-page-client";
import type { Locale } from "@/lib/transformers";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { SEARCH_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";
import { resolveBrandBySlugParam } from "@/lib/seo/resolve-entity-by-slug";
import {
  buildCatalogPageMetadata,
  resolveLocalizedSeoValue,
} from "@/lib/seo/page-metadata";
import { SITE_CONFIG } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const loadBrandPage = cache(async (slug: string, locale: Locale) => {
  const brandData = await resolveBrandBySlugParam(slug, locale);
  if (!brandData) {
    return null;
  }

  const initialSearchFilters = {
    q: "*",
    brand_ids: String(brandData.id),
    page: 1,
    per_page: 25,
  };

  const initialSearchData = await serverSearch(initialSearchFilters, locale).catch(
    () => null,
  );

  return { brandData, initialSearchFilters, initialSearchData };
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const { slug } = await params;
  const loaded = await loadBrandPage(slug, locale);

  if (!loaded) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }

  const { brandData, initialSearchData } = loaded;
  const isEmpty = initialSearchData != null && initialSearchData.total === 0;

  const title = resolveLocalizedSeoValue(
    locale,
    brandData.meta_title_en,
    brandData.meta_title_ar,
    resolveLocalizedSeoValue(
      locale,
      brandData.name_en,
      brandData.name_ar,
      SITE_CONFIG.name,
    ),
  );
  const description = resolveLocalizedSeoValue(
    locale,
    brandData.meta_description_en,
    brandData.meta_description_ar,
    resolveLocalizedSeoValue(
      locale,
      brandData.description_en,
      brandData.description_ar,
      title,
    ),
  );

  return buildCatalogPageMetadata({
    locale,
    pathnameWithoutLocale: `/brands/${brandData.slug}`,
    title,
    description,
    image: brandData.logo,
    noindex: isEmpty,
  });
}

export default async function BrandPage({ params }: PageProps) {
  const locale = (await getLocale()) as Locale;
  const { slug } = await params;
  const loaded = await loadBrandPage(slug, locale);

  if (!loaded) {
    notFound();
  }

  const { brandData, initialSearchFilters, initialSearchData } = loaded;

  return (
    <RouteIntlProvider locale={locale} namespaces={SEARCH_MESSAGE_NAMESPACES}>
      <EntitySlugPageClient
        type="brand"
        slug={brandData.slug}
        initialData={brandData}
        initialSearchFilters={initialSearchFilters}
        initialSearchData={initialSearchData}
      />
    </RouteIntlProvider>
  );
}
