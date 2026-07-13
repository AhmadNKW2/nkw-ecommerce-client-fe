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

const HOME_PRODUCT_IMAGE_SIZES =
  "(max-width: 768px) 184px, (max-width: 1024px) 220px, (max-width: 1280px) 240px, 220px";

function resolveLcpImageUrl(
  data: InfiniteData<SearchResponse> | undefined,
): string | null {
  const hits = data?.pages?.[0]?.hits ?? [];
  for (const hit of hits) {
    const image = hit.images?.[0]?.trim();
    if (image && !image.startsWith("/placeholder")) {
      return image;
    }
  }
  return null;
}

export default async function HomePage() {
  const locale = (await getLocale()) as Locale;
  const queryClient = getQueryClient();

  // Only await featured products for first paint / LCP. New arrivals hydrate after.
  await queryClient.prefetchInfiniteQuery({
    queryKey: SEARCH_QUERY_KEYS.infinite(featuredSearchFilters, locale),
    queryFn: ({ pageParam = 1 }) =>
      serverSearch({ ...featuredSearchFilters, page: pageParam }, locale),
    initialPageParam: 1,
  }).catch(() => undefined);

  // Warm new-arrivals without blocking TTFB.
  void queryClient.prefetchInfiniteQuery({
    queryKey: SEARCH_QUERY_KEYS.infinite(newArrivalsSearchFilters, locale),
    queryFn: ({ pageParam = 1 }) =>
      serverSearch({ ...newArrivalsSearchFilters, page: pageParam }, locale),
    initialPageParam: 1,
  });

  const dehydratedState = dehydrate(queryClient);
  const featuredData = queryClient.getQueryData<InfiniteData<SearchResponse>>(
    SEARCH_QUERY_KEYS.infinite(featuredSearchFilters, locale),
  );
  const lcpImageSrc = resolveLcpImageUrl(featuredData);

  let preloadLink: { href: string; imageSrcSet?: string; imageSizes?: string } | null =
    null;

  if (lcpImageSrc) {
    try {
      const {
        props: { srcSet, sizes, src },
      } = getImageProps({
        src: lcpImageSrc,
        alt: "",
        width: 256,
        height: 256,
        sizes: HOME_PRODUCT_IMAGE_SIZES,
        quality: 65,
      });

      preload(src, {
        as: "image",
        imageSrcSet: srcSet,
        imageSizes: sizes,
        fetchPriority: "high",
      });

      preloadLink = { href: src, imageSrcSet: srcSet, imageSizes: sizes };
    } catch {
      preloadLink = null;
    }
  }

  return (
    <RouteIntlProvider locale={locale} namespaces={HOME_MESSAGE_NAMESPACES}>
      {preloadLink ? (
        <link
          rel="preload"
          as="image"
          href={preloadLink.href}
          imageSrcSet={preloadLink.imageSrcSet}
          imageSizes={preloadLink.imageSizes}
          fetchPriority="high"
        />
      ) : null}
      <HydrationBoundary state={dehydratedState}>
        <HomePageClient />
      </HydrationBoundary>
    </RouteIntlProvider>
  );
}
