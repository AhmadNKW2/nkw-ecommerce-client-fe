import type { MetadataRoute } from "next";
import {
  PUBLIC_STATIC_PATHS,
  createEntitySitemapEntries,
  createLocalizedSitemapEntries,
  fetchSitemapBrands,
  fetchSitemapCategories,
  fetchSitemapProducts,
  fetchSitemapVendors,
} from "@/lib/sitemap-data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands, vendors] = await Promise.all([
    fetchSitemapProducts(),
    fetchSitemapCategories(),
    fetchSitemapBrands(),
    fetchSitemapVendors(),
  ]);

  const staticEntries = PUBLIC_STATIC_PATHS.flatMap((path) =>
    createLocalizedSitemapEntries(path, {
      changeFrequency: path === "/" ? "daily" : "weekly",
      priority: path === "/" ? 1 : 0.8,
    }),
  );

  const productEntries = createEntitySitemapEntries("/products", products, {
    changeFrequency: "daily",
    priority: 0.9,
  });

  const categoryEntries = createEntitySitemapEntries("/categories", categories, {
    changeFrequency: "weekly",
    priority: 0.7,
  });

  const brandEntries = createEntitySitemapEntries("/brands", brands, {
    changeFrequency: "weekly",
    priority: 0.7,
  });

  const vendorEntries = createEntitySitemapEntries("/vendors", vendors, {
    changeFrequency: "weekly",
    priority: 0.7,
  });

  return [
    ...staticEntries,
    ...productEntries,
    ...categoryEntries,
    ...brandEntries,
    ...vendorEntries,
  ];
}
