import type { Metadata } from "next";
import { isSearchDebugEnabled } from '@/lib/debug-fetch';
import { getLocale } from 'next-intl/server';
import { serverSearch } from '@/lib/search/api';
import { SearchPageClient } from '@/components/search/SearchPageClient';
import type { Locale } from '@/i18n/message-catalog';
import { RouteIntlProvider } from '@/i18n/route-intl-provider';
import { SEARCH_MESSAGE_NAMESPACES } from '@/i18n/scoped-messages';
import type { SearchFilters } from '@/lib/search/types';
import { parsePriceFromQuery } from '@/lib/search/parse-price-from-query';
import { buildNoIndexMetadata } from "@/lib/seo/page-metadata";

export const metadata: Metadata = buildNoIndexMetadata("Search");

const UI_PRICE_MIN_DEFAULT = 0;
const UI_PRICE_MAX_DEFAULT = 10_000;

function parseOptionalNumber(value?: string): number | undefined {
  if (!value) return undefined;

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
}

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const locale = (await getLocale()) as Locale;
  const params = await searchParams;
  const shouldDebug = isSearchDebugEnabled();

  if (shouldDebug) {
    console.log('SSR SEARCH PARAMS:', params);
  }

  const filters: SearchFilters = {
    q: params.q || '*',
    category_ids: params.category_ids,
    brand_ids: params.brand_ids,
    vendor_ids: params.vendor_ids,
    attributes_values_ids: params.attributes_values_ids,
    specifications_values_ids: params.specifications_values_ids,
    min_price: parseOptionalNumber(params.min_price),
    max_price: parseOptionalNumber(params.max_price),
    average_rating_min: parseOptionalNumber(params.average_rating_min),
    sort_by: params.sort_by as SearchFilters['sort_by'] | undefined,
    page: parseOptionalNumber(params.page) ?? 1,
    per_page: parseOptionalNumber(params.per_page) ?? 20,
  };

  if (filters.q && filters.q !== '*' && filters.min_price == null && filters.max_price == null) {
    const parsedPrice = parsePriceFromQuery(filters.q);
    if (parsedPrice.minPrice !== undefined) {
      filters.min_price = parsedPrice.minPrice;
    }
    if (parsedPrice.maxPrice !== undefined) {
      filters.max_price = parsedPrice.maxPrice;
    }

    // UI defaults for one-sided natural-language price filters:
    // - "more than X" => [0, X] visual range should be [X, 10000]
    // - "less than X" => [X] visual range should be [0, X]
    if (filters.min_price != null && filters.max_price == null) {
      filters.max_price = UI_PRICE_MAX_DEFAULT;
    } else if (filters.max_price != null && filters.min_price == null) {
      filters.min_price = UI_PRICE_MIN_DEFAULT;
    }
  }

  // Initial data fetched on the server — no loading spinner on first render.
  // Skip facets on SSR so product cards return sooner; client loads facets next.
  const initialData = await serverSearch(
    { ...filters, include_facets: false },
    locale,
  ).catch((error) => {
    if (shouldDebug) {
      console.log('SSR SEARCH ERROR:', error);
    }

    return null;
  });

  if (shouldDebug) {
    console.log('SSR SEARCH FILTERS:', filters);
    console.log('SSR DATA:', initialData);
  }

  return (
    <RouteIntlProvider locale={locale} namespaces={SEARCH_MESSAGE_NAMESPACES}>
      <SearchPageClient initialData={initialData} initialFilters={filters} />
    </RouteIntlProvider>
  );
}
