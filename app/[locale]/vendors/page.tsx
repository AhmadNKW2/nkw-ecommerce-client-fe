import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { EntityGridPage } from "@/components/layout/entity-grid-page";
import { vendorService } from "@/services/vendor.service";
import type { Locale } from "@/i18n/message-catalog";
import { buildCatalogPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("nav");

  return buildCatalogPageMetadata({
    locale,
    pathnameWithoutLocale: "/vendors",
    title: t("stores"),
    description: t("stores"),
  });
}

export default async function VendorsPage() {
  const t = await getTranslations("nav");
  const response = await vendorService.getAll({ limit: 1000 }).catch(() => null);
  const vendors = response?.data ?? [];

  return (
    <EntityGridPage
      type="vendor"
      data={vendors}
      isLoading={false}
      title={t("stores")}
    />
  );
}
