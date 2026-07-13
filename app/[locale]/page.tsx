import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { HomePageClient } from "@/components/home/home-page-client";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/message-catalog";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { HOME_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";
import { SEARCH_QUERY_KEYS } from "@/lib/search/search-query-keys";
import { getQueryClient } from "@/lib/query-client";
import { serverSearch } from "@/lib/search/api";
import type { SearchFilters } from "@/lib/search/types";

const productsPerPage = 40;

const featuredSearchFilters: Omit<SearchFilters, "page"> = {
  q: "*",
  is_out_of_stock: false,
  per_page: productsPerPage,
};

const newArrivalsSearchFilters: Omit<SearchFilters, "page"> = {
  q: "*",
  is_out_of_stock: false,
  sort_by: "created_at:desc",
  per_page: productsPerPage,
};

export default async function HomePage() {
  const locale = (await getLocale()) as Locale;
  const queryClient = getQueryClient();

  await Promise.allSettled([
    queryClient.prefetchInfiniteQuery({
      queryKey: SEARCH_QUERY_KEYS.infinite(featuredSearchFilters, locale),
      queryFn: ({ pageParam = 1 }) =>
        serverSearch({ ...featuredSearchFilters, page: pageParam }, locale),
      initialPageParam: 1,
    }),
    queryClient.prefetchInfiniteQuery({
      queryKey: SEARCH_QUERY_KEYS.infinite(newArrivalsSearchFilters, locale),
      queryFn: ({ pageParam = 1 }) =>
        serverSearch({ ...newArrivalsSearchFilters, page: pageParam }, locale),
      initialPageParam: 1,
    }),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <RouteIntlProvider locale={locale} namespaces={HOME_MESSAGE_NAMESPACES}>
      <HydrationBoundary state={dehydratedState}>
        <HomePageClient />
      </HydrationBoundary>
    </RouteIntlProvider>
  );
}
