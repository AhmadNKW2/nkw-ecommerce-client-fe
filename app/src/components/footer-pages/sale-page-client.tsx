"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useInfiniteProducts } from "@/hooks/useProducts";
import { useListingVariantProducts } from "@/hooks/useListingVariantProducts";
import type { Locale } from "@/lib/transformers";

interface SalePageClientProps {
  emptyTitle: string;
  emptyDescription: string;
}

export function SalePageClient({ emptyTitle, emptyDescription }: SalePageClientProps) {
  const locale = useLocale() as Locale;
  const tCommon = useTranslations("common");

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteProducts(
    {
      limit: 24,
      visible: true,
      has_sale: true,
      sortBy: "created_at",
      sortOrder: "DESC",
    },
    { enabled: true },
  );

  const rawProducts = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const { products } = useListingVariantProducts(rawProducts, locale);

  const saleProducts = useMemo(
    () => products.filter((product) => product.compareAtPrice != null && product.compareAtPrice > product.price),
    [products],
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="aspect-[0.72] animate-pulse rounded-r1 bg-gray-100" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-gray-100 p-6 text-center md:p-8">
        <div className="space-y-3">
          <p className="text-lg font-semibold text-primary">{tCommon("error")}</p>
          <p className="text-sm leading-7 text-third md:text-base">{emptyDescription}</p>
          <div className="flex justify-center">
            <Button type="button" onClick={() => void refetch()} backgroundColor="var(--color-secondary)">
              {tCommon("retry")}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (saleProducts.length === 0) {
    return (
      <Card className="border-gray-100 p-6 text-center md:p-8">
        <div className="space-y-2">
          <p className="text-lg font-semibold text-primary">{emptyTitle}</p>
          <p className="text-sm leading-7 text-third md:text-base">{emptyDescription}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ProductGrid products={saleProducts} />
      {hasNextPage ? (
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={() => void fetchNextPage()}
            isLoading={isFetchingNextPage}
            backgroundColor="var(--color-secondary)"
          >
            {tCommon("loadMoreProducts")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
