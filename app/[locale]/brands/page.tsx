import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { EntityGridPage } from "@/components/layout/entity-grid-page";
import { brandService } from "@/services/brand.service";
import type { Locale } from "@/i18n/message-catalog";
import { buildCatalogPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("nav");

  return buildCatalogPageMetadata({
    locale,
    pathnameWithoutLocale: "/brands",
    title: t("brands"),
    description: t("brands"),
  });
}

export default async function BrandsPage() {
  const t = await getTranslations("nav");
  const response = await brandService.getAll({ limit: 1000 }).catch(() => null);
  const brands = response?.data ?? [];

  return (
    <EntityGridPage
      type="brand"
      data={brands}
      isLoading={false}
      title={t("brands")}
    />
  );
}
