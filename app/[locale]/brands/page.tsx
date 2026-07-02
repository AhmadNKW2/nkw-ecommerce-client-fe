import { getTranslations } from "next-intl/server";
import { EntityGridPage } from "@/components/layout/entity-grid-page";
import { brandService } from "@/services/brand.service";

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
