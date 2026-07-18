import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { serverSearch } from "@/lib/search/api";
import { EntitySlugPageClient } from "@/components/layout/entity-slug-page-client";
import type { Locale } from "@/lib/transformers";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { SEARCH_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";
import { resolveVendorBySlugParam } from "@/lib/seo/resolve-entity-by-slug";
import {
  buildCatalogPageMetadata,
  resolveLocalizedSeoValue,
} from "@/lib/seo/page-metadata";
import { SITE_CONFIG } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const loadVendorPage = cache(async (slug: string, locale: Locale) => {
  const vendorData = await resolveVendorBySlugParam(slug, locale);
  if (!vendorData) {
    return null;
  }

  const initialSearchFilters = {
    q: "*",
    vendor_ids: String(vendorData.id),
    page: 1,
    per_page: 25,
  };

  const initialSearchData = await serverSearch(initialSearchFilters, locale).catch(
    () => null,
  );

  return { vendorData, initialSearchFilters, initialSearchData };
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const { slug } = await params;
  const loaded = await loadVendorPage(slug, locale);

  if (!loaded) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }

  const { vendorData, initialSearchData } = loaded;
  const isEmpty = initialSearchData != null && initialSearchData.total === 0;

  const title = resolveLocalizedSeoValue(
    locale,
    vendorData.meta_title_en,
    vendorData.meta_title_ar,
    resolveLocalizedSeoValue(
      locale,
      vendorData.name_en,
      vendorData.name_ar,
      SITE_CONFIG.name,
    ),
  );
  const description = resolveLocalizedSeoValue(
    locale,
    vendorData.meta_description_en,
    vendorData.meta_description_ar,
    resolveLocalizedSeoValue(
      locale,
      vendorData.description_en,
      vendorData.description_ar,
      title,
    ),
  );

  return buildCatalogPageMetadata({
    locale,
    pathnameWithoutLocale: `/vendors/${vendorData.slug}`,
    title,
    description,
    image: vendorData.logo,
    noindex: isEmpty,
  });
}

export default async function VendorPage({ params }: PageProps) {
  const locale = (await getLocale()) as Locale;
  const { slug } = await params;
  const loaded = await loadVendorPage(slug, locale);

  if (!loaded) {
    notFound();
  }

  const { vendorData, initialSearchFilters, initialSearchData } = loaded;

  return (
    <RouteIntlProvider locale={locale} namespaces={SEARCH_MESSAGE_NAMESPACES}>
      <EntitySlugPageClient
        type="vendor"
        slug={vendorData.slug}
        initialData={vendorData}
        initialSearchFilters={initialSearchFilters}
        initialSearchData={initialSearchData}
      />
    </RouteIntlProvider>
  );
}
