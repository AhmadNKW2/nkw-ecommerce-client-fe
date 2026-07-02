import { getLocale, getTranslations } from "next-intl/server";
import { EntityGridPage } from "@/components/layout/entity-grid-page";
import { categoryService } from "@/services/category.service";
import { transformCategory, type Locale } from "@/lib/transformers";

export default async function CategoriesPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("categories");
  const response = await categoryService.getRootCategories({ limit: 500 }).catch(() => null);
  const categories = (response?.data ?? []).map((category) => {
    const transformed = transformCategory(category, locale);
    return {
      id: Number(transformed.id),
      name: transformed.name,
      slug: transformed.slug,
      image: transformed.image,
      productCount: transformed.productCount,
    };
  });

  return (
    <EntityGridPage
      type="category"
      data={categories}
      isLoading={false}
      title={t("shopByCategory")}
      subtitle={t("shopByCategoryDesc")}
    />
  );
}
