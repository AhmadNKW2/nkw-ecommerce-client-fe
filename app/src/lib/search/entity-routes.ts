import type { FacetCount } from './types';

export type EntityFilterType = 'brand' | 'category' | 'vendor';

const ENTITY_FILTER_PARAM: Record<EntityFilterType, string> = {
  brand: 'brand_ids',
  category: 'category_ids',
  vendor: 'vendor_ids',
};

const ENTITY_PAGE_BASE: Record<EntityFilterType, string> = {
  brand: '/brands',
  category: '/categories',
  vendor: '/vendors',
};

const ENTITY_FACET_FIELDS: Record<EntityFilterType, string[]> = {
  brand: ['brand_ids', 'brand_id'],
  category: ['categories_ids', 'category_ids', 'category_id'],
  vendor: ['vendor_ids', 'vendor_id'],
};

export function parseEntityIdFromSlug(slug: string): number | null {
  const suffixMatch = slug.match(/-(\d+)$/);
  if (suffixMatch) {
    const id = Number(suffixMatch[1]);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  const numericSlug = Number(slug);
  return Number.isInteger(numericSlug) && numericSlug > 0 ? numericSlug : null;
}

export function resolveEntitySlug(entity: { slug?: string | null; id: number | string }): string {
  const slug = entity.slug?.trim();
  if (slug) return slug;
  return String(entity.id);
}

export function buildEntityPageHref(
  type: EntityFilterType,
  slugOrEntity: string | { slug?: string | null; id: number | string },
): string {
  const slug = typeof slugOrEntity === 'string'
    ? slugOrEntity
    : resolveEntitySlug(slugOrEntity);

  return `${ENTITY_PAGE_BASE[type]}/${slug}`;
}

/** @deprecated Use buildEntityPageHref for storefront navigation. */
export function buildEntitySearchHref(
  type: EntityFilterType,
  id: number | string,
): string {
  const param = ENTITY_FILTER_PARAM[type];
  return `/search?${param}=${id}`;
}

export function findEntityFacet(
  facets: FacetCount[] | undefined,
  type: EntityFilterType,
): FacetCount | undefined {
  const fieldNames = ENTITY_FACET_FIELDS[type];
  return facets?.find((facet) => fieldNames.includes(facet.field_name));
}

export function extractFacetGridData(
  facets: FacetCount[] | undefined,
  type: EntityFilterType,
  locale = 'en',
): Array<{
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
  logo?: string;
  image?: string;
  productCount?: number;
  name?: string;
}> {
  const facet = findEntityFacet(facets, type);
  if (!facet) return [];

  const isAr = locale === 'ar';

  return facet.counts
    .map((item) => {
      const id = Number(item.value);
      if (!Number.isInteger(id) || id <= 0) return null;

      const label = item.label?.trim() || item.value;
      const slug = item.slug?.trim() || String(id);

      return {
        id,
        name_en: label,
        name_ar: label,
        slug,
        productCount: item.count,
        ...(type === 'category'
          ? { image: undefined, name: isAr ? label : label }
          : { logo: undefined }),
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((left, right) => (right.productCount ?? 0) - (left.productCount ?? 0));
}

export function resolveEntityLabelFromFacets(
  facets: FacetCount[] | undefined,
  type: EntityFilterType,
  id: number | string,
  locale = 'en',
): string | undefined {
  const facet = findEntityFacet(facets, type);
  const normalizedId = String(id);
  const match = facet?.counts.find((item) => item.value === normalizedId);
  if (!match?.label?.trim()) return undefined;

  return match.label.trim();
}
