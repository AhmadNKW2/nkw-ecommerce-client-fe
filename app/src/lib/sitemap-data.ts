import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { routing } from "@/i18n/routing";
import type { PaginatedResponse } from "@/types/api.types";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "").replace(/\/$/, "");
const PAGE_SIZE = 100;

export const PUBLIC_STATIC_PATHS = [
  "/",
  "/products",
  "/categories",
  "/brands",
  "/vendors",
  "/about",
  "/contact",
  "/faqs",
  "/shipping",
  "/privacy",
  "/terms",
  "/cookies",
  "/accessibility",
] as const;

type SitemapEntity = {
  slug: string;
  lastModified?: string | Date;
};

type SitemapEntryOptions = {
  lastModified?: string | Date;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority?: number;
};

function getLocalizedPath(locale: string, pathname: string): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (locale === routing.defaultLocale) {
    return normalizedPath;
  }

  return normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`;
}

function getAbsoluteUrl(locale: string, pathname: string): string {
  const path = getLocalizedPath(locale, pathname);
  return path === "/" ? `${SITE_CONFIG.url}/` : `${SITE_CONFIG.url}${path}`;
}

export function createLocalizedSitemapEntries(
  pathname: string,
  options: SitemapEntryOptions = {},
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, getAbsoluteUrl(locale, pathname)]),
  ) as Record<string, string>;

  languages["x-default"] = getAbsoluteUrl(routing.defaultLocale, pathname);

  return routing.locales.map((locale) => ({
    url: getAbsoluteUrl(locale, pathname),
    lastModified: options.lastModified,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    alternates: { languages },
  }));
}

type ApiListPayload<T> = {
  success?: boolean;
  data?: T[] | T;
  meta?: PaginatedResponse<T>["meta"];
};

async function fetchJson<T>(path: string): Promise<T | null> {
  if (!API_BASE) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function unwrapListPayload<T>(payload: ApiListPayload<T> | T[] | null): T[] {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  const data = payload.data;
  return Array.isArray(data) ? data : data ? [data] : [];
}

async function fetchPaginated<T>(
  buildPath: (page: number) => string,
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const payload = await fetchJson<ApiListPayload<T> | T[]>(buildPath(page));
    const pageItems = unwrapListPayload(payload);

    if (pageItems.length === 0) {
      break;
    }

    items.push(...pageItems);

    const meta =
      payload && !Array.isArray(payload) && payload.meta
        ? payload.meta
        : undefined;

    totalPages = meta?.totalPages ?? 1;
    page += 1;
  }

  return items;
}

async function fetchList<T>(path: string): Promise<T[]> {
  const payload = await fetchJson<ApiListPayload<T> | T[]>(path);
  return unwrapListPayload(payload);
}

export async function fetchSitemapProducts(): Promise<SitemapEntity[]> {
  const products = await fetchPaginated<{ slug: string; updated_at?: string }>(
    (page) => `/products?limit=${PAGE_SIZE}&page=${page}&visible=true`,
  );

  return products
    .filter((product) => Boolean(product.slug))
    .map((product) => ({
      slug: product.slug,
      lastModified: product.updated_at,
    }));
}

export async function fetchSitemapCategories(): Promise<SitemapEntity[]> {
  const categories = await fetchPaginated<{ slug: string; updatedAt?: string }>(
    (page) => `/categories?limit=${PAGE_SIZE}&page=${page}&visible=true`,
  );

  return categories
    .filter((category) => Boolean(category.slug))
    .map((category) => ({
      slug: category.slug,
      lastModified: category.updatedAt,
    }));
}

export async function fetchSitemapBrands(): Promise<SitemapEntity[]> {
  const brands = await fetchPaginated<{ slug: string; updated_at?: string }>(
    (page) => `/brands?limit=${PAGE_SIZE}&page=${page}&visible=true`,
  );

  return brands
    .filter((brand) => Boolean(brand.slug))
    .map((brand) => ({
      slug: brand.slug,
      lastModified: brand.updated_at,
    }));
}

export async function fetchSitemapVendors(): Promise<SitemapEntity[]> {
  const vendors = await fetchList<{ slug: string; updated_at?: string; visible?: boolean }>(
    "/vendors",
  );

  return vendors
    .filter((vendor) => Boolean(vendor.slug) && vendor.visible !== false)
    .map((vendor) => ({
      slug: vendor.slug,
      lastModified: vendor.updated_at,
    }));
}

export function createEntitySitemapEntries(
  basePath: "/products" | "/categories" | "/brands" | "/vendors",
  entities: SitemapEntity[],
  options: Omit<SitemapEntryOptions, "lastModified"> = {},
): MetadataRoute.Sitemap {
  return entities.flatMap((entity) =>
    createLocalizedSitemapEntries(`${basePath}/${entity.slug}`, {
      ...options,
      lastModified: entity.lastModified,
    }),
  );
}
