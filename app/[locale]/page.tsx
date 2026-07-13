import { HydrationBoundary, dehydrate, type InfiniteData } from "@tanstack/react-query";
import { getImageProps } from "next/image";
import { preload } from "react-dom";
import { HomePageClient } from "@/components/home/home-page-client";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/message-catalog";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { HOME_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";
import { SEARCH_QUERY_KEYS } from "@/lib/search/search-query-keys";
import { getQueryClient } from "@/lib/query-client";
import { serverSearch } from "@/lib/search/api";
import type { SearchFilters, SearchResponse } from "@/lib/search/types";

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

/** Matches ProductCard default sizes; mobile card ~184px so prefer ~42–50vw. */
const HOME_PRODUCT_IMAGE_SIZES =
  "(max-width: 768px) 42vw, (max-width: 1024px) 30vw, (max-width: 1280px) 22vw, 18vw";

function resolveLcpImageUrl(
  data: InfiniteData<SearchResponse> | undefined,
): string | null {
  const image = data?.pages?.[0]?.hits?.[0]?.images?.[0]?.trim();
  if (!image || image.startsWith("/placeholder")) {
    return null;
  }
  return image;
}

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
  const featuredData = queryClient.getQueryData<InfiniteData<SearchResponse>>(
    SEARCH_QUERY_KEYS.infinite(featuredSearchFilters, locale),
  );
  const lcpImageSrc = resolveLcpImageUrl(featuredData);

  if (lcpImageSrc) {
    try {
      const {
        props: { srcSet, sizes, src },
      } = getImageProps({
        src: lcpImageSrc,
        alt: "",
        width: 384,
        height: 384,
        sizes: HOME_PRODUCT_IMAGE_SIZES,
        quality: 75,
      });

      // React 19 emits a head preload with fetchPriority=high for LCP discovery.
      preload(src, {
        as: "image",
        imageSrcSet: srcSet,
        imageSizes: sizes,
        fetchPriority: "high",
      });
    } catch {
      // Skip preload if the optimizer cannot build props.
    }
  }

  return (
    <RouteIntlProvider locale={locale} namespaces={HOME_MESSAGE_NAMESPACES}>
      <HydrationBoundary state={dehydratedState}>
        <HomePageClient />
      </HydrationBoundary>
    </RouteIntlProvider>
  );
}
