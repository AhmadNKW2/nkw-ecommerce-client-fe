"use client";

import { Suspense } from "react";
import { EntityListingPage } from "@/components/layout/entity-listing-page";
import type { SearchFilters } from "@/lib/search/types";

interface ProductsPageClientProps {
  pageTitle?: string;
  pageSubtitle?: string;
  breadcrumbLabel?: string;
  initialSearchFilters?: Partial<SearchFilters>;
}

export function ProductsPageClient({
  pageTitle,
  pageSubtitle,
  breadcrumbLabel,
  initialSearchFilters,
}: ProductsPageClientProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EntityListingPage
        type="products"
        pageTitle={pageTitle}
        pageDescription={pageSubtitle}
        breadcrumbLabel={breadcrumbLabel}
        initialSearchFilters={initialSearchFilters}
      />
    </Suspense>
  );
}