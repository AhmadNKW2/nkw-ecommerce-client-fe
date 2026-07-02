import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { vendorService } from "@/services/vendor.service";
import { serverSearch } from "@/lib/search/api";
import { EntitySlugPageClient } from "@/components/layout/entity-slug-page-client";
import type { Locale } from "@/lib/transformers";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { SEARCH_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function VendorPage({ params }: PageProps) {
  const locale = (await getLocale()) as Locale;
  const { slug } = await params;
  const vendorData = await vendorService.getBySlug(slug).catch(() => null);

  if (!vendorData) {
    notFound();
  }

  const initialSearchFilters = {
    q: "*",
    vendor_ids: String(vendorData.id),
    page: 1,
    per_page: 25,
  };

  const initialSearchData = await serverSearch(initialSearchFilters, locale).catch(() => null);

  return (
    <RouteIntlProvider locale={locale} namespaces={SEARCH_MESSAGE_NAMESPACES}>
      <EntitySlugPageClient
        type="vendor"
        slug={slug}
        initialData={vendorData}
        initialSearchFilters={initialSearchFilters}
        initialSearchData={initialSearchData}
      />
    </RouteIntlProvider>
  );
}
