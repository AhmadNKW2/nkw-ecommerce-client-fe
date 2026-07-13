"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ProductsSection } from "@/components/home/featured-products";
import { useListingVariantProducts } from "@/hooks/useListingVariantProducts";
import type { Locale } from "@/lib/transformers";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { useInfiniteSearchProducts } from "@/lib/search/use-search";
import type { SearchFilters } from "@/lib/search/types";

export function HomePageClient() {
  const locale = useLocale() as Locale;
  const t = useTranslations("home");

  const productsPerPage = 40;

  const featuredSearchFilters = useMemo<Omit<SearchFilters, "page">>(
    () => ({
      q: "*",
      is_out_of_stock: false,
      per_page: productsPerPage,
    }),
    [productsPerPage],
  );

  const newArrivalsSearchFilters = useMemo<Omit<SearchFilters, "page">>(
    () => ({
      q: "*",
      is_out_of_stock: false,
      sort_by: "created_at:desc",
      per_page: productsPerPage,
    }),
    [productsPerPage],
  );

  const {
    data: featuredInfiniteData,
    isPending: featuredLoading,
    isFetchingNextPage: featuredFetchingNext,
    hasNextPage: featuredHasNextPage,
    fetchNextPage: featuredFetchNextPage,
  } = useInfiniteSearchProducts(featuredSearchFilters, { locale });

  const featuredData = useMemo(
    () => featuredInfiniteData?.pages.flatMap((page) => page.hits) ?? [],
    [featuredInfiniteData],
  );

  const {
    data: newInfiniteData,
    isPending: newLoading,
    isFetchingNextPage: newFetchingNext,
    hasNextPage: newHasNextPage,
    fetchNextPage: newFetchNextPage,
  } = useInfiniteSearchProducts(newArrivalsSearchFilters, { locale });

  const newData = useMemo(
    () => newInfiniteData?.pages.flatMap((page) => page.hits) ?? [],
    [newInfiniteData],
  );

  const { products: featuredProducts } = useListingVariantProducts(featuredData, locale);
  const { products: newProducts } = useListingVariantProducts(newData, locale);

  return (
    <>
      <section>
        {featuredLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <ProductsSection
            products={featuredProducts}
            title={t("featuredProducts")}
            subtitle={t("featuredSubtitle")}
            hasMore={featuredHasNextPage ?? false}
            onLoadMore={() => featuredFetchNextPage()}
            isLoading={featuredFetchingNext}
            showHeader={false}
            priorityCount={8}
          />
        )}
      </section>

      <section>
        {newLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <ProductsSection
            products={newProducts}
            title={t("newArrivals")}
            subtitle={t("newArrivalsSubtitle")}
            viewAllHref="/search?sort_by=created_at:desc"
            hasMore={newHasNextPage ?? false}
            onLoadMore={() => newFetchNextPage()}
            isLoading={newFetchingNext}
          />
        )}
      </section>
    </>
  );
}
