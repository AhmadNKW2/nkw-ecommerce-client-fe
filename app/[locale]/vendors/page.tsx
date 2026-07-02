import { getTranslations } from "next-intl/server";
import { EntityGridPage } from "@/components/layout/entity-grid-page";
import { vendorService } from "@/services/vendor.service";

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
