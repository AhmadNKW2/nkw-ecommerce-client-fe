import { permanentRedirect } from "next/navigation";
import { brandService } from "@/services/brand.service";
import { categoryService } from "@/services/category.service";
import { vendorService } from "@/services/vendor.service";
import { parseEntityIdFromSlug } from "@/lib/search/entity-routes";
import { getLocalizedPath } from "@/lib/seo/localized-path";
import type { BrandDetail, CategoryDetail, VendorDetail } from "@/types/api.types";

function isPureNumericSlug(slug: string): boolean {
  return /^\d+$/.test(slug);
}

async function redirectNumericIdToSlug(
  locale: string,
  basePath: "/brands" | "/categories" | "/vendors",
  slug: string,
  entity: { slug?: string | null } | null,
): Promise<void> {
  const canonicalSlug = entity?.slug?.trim();
  if (!canonicalSlug || canonicalSlug === slug) {
    return;
  }

  permanentRedirect(getLocalizedPath(locale, `${basePath}/${canonicalSlug}`));
}

export async function resolveBrandBySlugParam(
  slug: string,
  locale: string,
): Promise<BrandDetail | null> {
  const bySlug = await brandService.getBySlug(slug).catch(() => null);
  if (bySlug) {
    return bySlug;
  }

  if (!isPureNumericSlug(slug)) {
    return null;
  }

  const id = parseEntityIdFromSlug(slug);
  if (!id) {
    return null;
  }

  const byId = await brandService.getById(id).catch(() => null);
  await redirectNumericIdToSlug(locale, "/brands", slug, byId);
  return byId;
}

export async function resolveCategoryBySlugParam(
  slug: string,
  locale: string,
): Promise<CategoryDetail | null> {
  const bySlug = await categoryService.getBySlug(slug).catch(() => null);
  if (bySlug) {
    return bySlug;
  }

  if (!isPureNumericSlug(slug)) {
    return null;
  }

  const id = parseEntityIdFromSlug(slug);
  if (!id) {
    return null;
  }

  const byId = await categoryService.getById(id).catch(() => null);
  await redirectNumericIdToSlug(locale, "/categories", slug, byId);
  return byId;
}

export async function resolveVendorBySlugParam(
  slug: string,
  locale: string,
): Promise<VendorDetail | null> {
  const bySlug = await vendorService.getBySlug(slug).catch(() => null);
  if (bySlug) {
    return bySlug;
  }

  if (!isPureNumericSlug(slug)) {
    return null;
  }

  const id = parseEntityIdFromSlug(slug);
  if (!id) {
    return null;
  }

  const byId = await vendorService.getById(id).catch(() => null);
  await redirectNumericIdToSlug(locale, "/vendors", slug, byId);
  return byId;
}
