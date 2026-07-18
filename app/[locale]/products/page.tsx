import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ProductsPageClient } from "@/components/layout/products-page-client";
import type { Locale } from "@/i18n/message-catalog";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { LISTING_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";
import type { SearchFilters } from "@/lib/search/types";
import { buildCatalogPageMetadata } from "@/lib/seo/page-metadata";

type ProductsPageProps = {
  searchParams?: Promise<{
    filter?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const resolvedSearchParams = (await searchParams) ?? {};
  const productT = await getTranslations("product");
  const navigationT = await getTranslations("navigation");
  const homeT = await getTranslations("home");
  const routeVariant = resolveProductsRouteVariant(
    resolvedSearchParams.filter,
    productT,
    navigationT,
    homeT,
  );

  return buildCatalogPageMetadata({
    locale,
    pathnameWithoutLocale: "/products",
    title: routeVariant.pageTitle,
    description: routeVariant.pageSubtitle,
  });
}

function resolveProductsRouteVariant(
  filter: string | undefined,
  productT: Awaited<ReturnType<typeof getTranslations>>,
  navigationT: Awaited<ReturnType<typeof getTranslations>>,
  homeT: Awaited<ReturnType<typeof getTranslations>>,
) {
  const normalizedFilter = filter?.trim().toLowerCase();

  if (normalizedFilter === "new") {
    return {
      pageTitle: navigationT("newArrivals"),
      pageSubtitle: homeT("newArrivalsSubtitle"),
      breadcrumbLabel: navigationT("newArrivals"),
      initialSearchFilters: {
        sort_by: "created_at:desc",
      } satisfies Partial<SearchFilters>,
    };
  }

  if (normalizedFilter === "bestsellers") {
    return {
      pageTitle: navigationT("bestSellers"),
      pageSubtitle: navigationT("bestSellersDesc"),
      breadcrumbLabel: navigationT("bestSellers"),
      initialSearchFilters: {
        sort_by: "popularity_score:desc",
      } satisfies Partial<SearchFilters>,
    };
  }

  return {
    pageTitle: productT("allProductsTitle"),
    pageSubtitle: productT("allProductsSubtitle"),
    breadcrumbLabel: undefined,
    initialSearchFilters: {} satisfies Partial<SearchFilters>,
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const locale = (await getLocale()) as Locale;
  const resolvedSearchParams = (await searchParams) ?? {};
  const productT = await getTranslations("product");
  const navigationT = await getTranslations("navigation");
  const homeT = await getTranslations("home");
  const routeVariant = resolveProductsRouteVariant(
    resolvedSearchParams.filter,
    productT,
    navigationT,
    homeT,
  );

  return (
    <RouteIntlProvider locale={locale} namespaces={LISTING_MESSAGE_NAMESPACES}>
      <ProductsPageClient
        pageTitle={routeVariant.pageTitle}
        pageSubtitle={routeVariant.pageSubtitle}
        breadcrumbLabel={routeVariant.breadcrumbLabel}
        initialSearchFilters={routeVariant.initialSearchFilters}
      />
    </RouteIntlProvider>
  );
}
