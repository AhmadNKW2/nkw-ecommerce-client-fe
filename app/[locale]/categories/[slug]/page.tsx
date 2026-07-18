import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { serverSearch } from "@/lib/search/api";
import { EntitySlugPageClient } from "@/components/layout/entity-slug-page-client";
import type { Locale } from "@/lib/transformers";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { SEARCH_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";
import { resolveCategoryBySlugParam } from "@/lib/seo/resolve-entity-by-slug";
import {
  buildCatalogPageMetadata,
  resolveLocalizedSeoValue,
} from "@/lib/seo/page-metadata";
import { SITE_CONFIG } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const loadCategoryPage = cache(async (slug: string, locale: Locale) => {
  const categoryData = await resolveCategoryBySlugParam(slug, locale);
  if (!categoryData) {
    return null;
  }

  const initialSearchFilters = {
    q: "*",
    category_ids: String(categoryData.id),
    page: 1,
    per_page: 25,
  };

  const initialSearchData = await serverSearch(initialSearchFilters, locale).catch(
    () => null,
  );

  return { categoryData, initialSearchFilters, initialSearchData };
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const { slug } = await params;
  const loaded = await loadCategoryPage(slug, locale);

  if (!loaded) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }

  const { categoryData, initialSearchData } = loaded;
  const isEmpty = initialSearchData != null && initialSearchData.total === 0;

  const title = resolveLocalizedSeoValue(
    locale,
    categoryData.meta_title_en,
    categoryData.meta_title_ar,
    resolveLocalizedSeoValue(
      locale,
      categoryData.name_en,
      categoryData.name_ar,
      SITE_CONFIG.name,
    ),
  );
  const description = resolveLocalizedSeoValue(
    locale,
    categoryData.meta_description_en,
    categoryData.meta_description_ar,
    resolveLocalizedSeoValue(
      locale,
      categoryData.description_en,
      categoryData.description_ar,
      title,
    ),
  );

  return buildCatalogPageMetadata({
    locale,
    pathnameWithoutLocale: `/categories/${categoryData.slug}`,
    title,
    description,
    image: categoryData.image,
    noindex: isEmpty,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const locale = (await getLocale()) as Locale;
  const { slug } = await params;
  const loaded = await loadCategoryPage(slug, locale);

  if (!loaded) {
    notFound();
  }

  const { categoryData, initialSearchFilters, initialSearchData } = loaded;
  const isEmpty = initialSearchData != null && initialSearchData.total === 0;
  const hasChildren = Boolean(categoryData.children?.length);

  // Soft 404 fix: empty leaf categories should be real 404s, not thin 200 pages.
  if (isEmpty && !hasChildren) {
    notFound();
  }

  return (
    <RouteIntlProvider locale={locale} namespaces={SEARCH_MESSAGE_NAMESPACES}>
      <EntitySlugPageClient
        type="category"
        slug={categoryData.slug}
        initialData={categoryData}
        initialSearchFilters={initialSearchFilters}
        initialSearchData={initialSearchData}
      />
    </RouteIntlProvider>
  );
}
