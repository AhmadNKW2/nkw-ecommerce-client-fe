import { HydrationBoundary, dehydrate, type InfiniteData } from "@tanstack/react-query";
import { getImageProps } from "next/image";
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
  "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw";

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

  let lcpPreload: { imageSrcSet?: string; imageSizes?: string; href?: string } | null =
    null;

  if (lcpImageSrc) {
    try {
      const {
        props: { srcSet, sizes, src },
      } = getImageProps({
        src: lcpImageSrc,
        alt: "",
        width: 640,
        height: 640,
        sizes: HOME_PRODUCT_IMAGE_SIZES,
        // Match ProductCard default quality / priority path for the first grid card.
        quality: 75,
      });

      lcpPreload = {
        imageSrcSet: srcSet,
        imageSizes: sizes,
        href: src,
      };
    } catch {
      // If the optimizer cannot build props (bad URL), skip preload.
      lcpPreload = null;
    }
  }

  return (
    <RouteIntlProvider locale={locale} namespaces={HOME_MESSAGE_NAMESPACES}>
      {lcpPreload ? (
        <link
          rel="preload"
          as="image"
          href={lcpPreload.href}
          imageSrcSet={lcpPreload.imageSrcSet}
          imageSizes={lcpPreload.imageSizes}
          fetchPriority="high"
        />
      ) : null}
      <HydrationBoundary state={dehydratedState}>
        <HomePageClient />
      </HydrationBoundary>
    </RouteIntlProvider>
  );
}
