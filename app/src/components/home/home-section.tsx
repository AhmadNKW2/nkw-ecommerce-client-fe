"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { ViewAllLink } from "@/components/home/view-all-link";
import { Button, ResponsiveGrid } from "@/components/ui";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/types";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { SectionHeader } from "./section-header";

type BaseSectionProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  viewAllHref?: string;
  showViewAll?: boolean;
  showHeader?: boolean;
};

type ProductsVariantProps = BaseSectionProps & {
  variant?: "products";
  products: Product[];
  showLoadMore?: boolean;
  /** External control: when provided, overrides internal visible-count logic.
   *  Set to `true` when there are more API pages to load, `false` when exhausted. */
  hasMore?: boolean;
  showNavArrows?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
  initialVisibleCount?: number;
  /** Configuration for how many rows to add at once in client-side loading mode */
  loadMoreRows?: number;
};

export type HomeSectionProps = ProductsVariantProps;

export function HomeSection(props: HomeSectionProps) {
  const t = useTranslations("common");
  const showViewAll = props.showViewAll ?? true;

  // products variant
  const {
    title,
    subtitle,
    products,
    viewAllHref,
    showLoadMore = true,
    hasMore,
    showNavArrows = false,
    onLoadMore,
    isLoading = false,
    initialVisibleCount = 5,
    loadMoreRows = 2, // Easily edit the number of extra rows to load here
    showHeader = true,
  } = props;

  const {
    scrollerRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
  } = useHorizontalScroll(320);

  // Track responsive columns for rounding product counts
  const [cols, setCols] = useState(5);

  useEffect(() => {
    const updateCols = () => {
      const width = document.documentElement.clientWidth;
      if (width < 768) setCols(2); // md
      else if (width < 1024) setCols(3); // lg
      else if (width < 1280) setCols(4); // xl
      else setCols(5);
    };
    if (typeof window !== "undefined") {
      updateCols();
      window.addEventListener("resize", updateCols);
      return () => window.removeEventListener("resize", updateCols);
    }
  }, []);

  const [visibleCount, setVisibleCount] = useState(
    Math.min(products.length, Math.max(0, initialVisibleCount))
  );

  useEffect(() => {
    setVisibleCount(Math.min(products.length, Math.max(0, initialVisibleCount)));
  }, [products.length, initialVisibleCount]);

  // When `hasMore` is provided externally (API pagination mode), show ALL fetched
  // products without client-side slicing. Otherwise fall back to internal slicing.
  const visibleProducts = useMemo(() => {
    if (showNavArrows) return products;

    let rawProducts = products;
    if (hasMore === undefined) {
      rawProducts = products.slice(0, Math.max(0, visibleCount));
    }

    // Ensures the number of displayed products is always a multiple of the current columns
    // "so if its 5 so if the number of showed products is 26 it must be 25 because 25 is the nearest number %5 ==0"
    const maxVisible = Math.floor(rawProducts.length / cols) * cols;
    return rawProducts.slice(0, Math.max(cols, maxVisible));
  }, [products, showNavArrows, visibleCount, hasMore, cols]);

  const canShowLoadMore =
    showLoadMore &&
    !showNavArrows &&
    (hasMore !== undefined ? hasMore : visibleCount < products.length);

  if (products.length === 0) return null;

  const headerRight = (
    <div className="flex items-center gap-5">
      {showNavArrows && products.length > 4 ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollLeft()}
            disabled={!canScrollLeft}
            className={cn(
              "p-2 rounded-full border border-gray-200 transition-all duration-300",
              canScrollLeft
                ? "bg-white hover:bg-gray-50 hover:border-primary text-primary hover:text-primary"
                : "bg-gray-100 text-third cursor-not-allowed"
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollRight()}
            disabled={!canScrollRight}
            className={cn(
              "p-2 rounded-full border border-gray-200 transition-all duration-300",
              canScrollRight
                ? "bg-white hover:bg-gray-50 hover:border-primary text-primary hover:text-primary"
                : "bg-gray-100 text-third cursor-not-allowed"
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      ) : null}

      {showViewAll && viewAllHref ? <ViewAllLink href={viewAllHref} /> : null}
    </div>
  );

  return (
    <section>
      {showHeader ? (
        <SectionHeader title={title} subtitle={subtitle} right={headerRight} />
      ) : null}

      {showNavArrows ? (
        <div
          ref={scrollerRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {visibleProducts.map((product, idx) => (
            <div key={`${product.id}-${product.defaultVariantId ?? "base"}-${idx}`} className="w-70 shrink-0">
              <ProductCard product={product}
                cartButtonVariant="floating"
                cartButtonColor="white"
                cartButtonIcon="add-to-cart"
              />
            </div>
          ))}
        </div>
      ) : (
        <ResponsiveGrid>
          {visibleProducts.map((product, idx) => (
            <motion.div
              key={`${product.id}-${product.defaultVariantId ?? "base"}-${idx}`}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <ProductCard 
                product={product} 
                cartButtonVariant="floating"
                cartButtonColor="white"
                cartButtonIcon="add-to-cart"
              />
            </motion.div>
          ))}
        </ResponsiveGrid>
      )}

      {canShowLoadMore ? (
        <div className="flex justify-center pt-10 pb-5">
          <Button
            variant="pill"
            size="lg"
            onClick={() => {
              if (isLoading) return;
              if (hasMore !== undefined) {
                // API pagination mode: delegate entirely to external handler
                onLoadMore?.();
              } else {
                // Client-side slicing mode
                setVisibleCount((current) =>
                  Math.min(products.length, current + Math.max(0, loadMoreRows * cols))
                );
                onLoadMore?.();
              }
            }}
            className="min-w-50 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              t("loadMoreProducts")
            )}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

export type ProductsSectionProps = Omit<ProductsVariantProps, "variant">;
export function ProductsSection(props: ProductsSectionProps) {
  return (
    <HomeSection
      variant="products"
      {...props}
      viewAllHref={props.viewAllHref ?? "/products?filter=featured"}
      title={props.title ?? "Featured Products"}
      subtitle={props.subtitle ?? "Handpicked items just for you"}
    />
  );
}

// Backwards-compatible export
export const FeaturedProducts = ProductsSection;
