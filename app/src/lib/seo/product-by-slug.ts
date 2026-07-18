import { cache } from "react";
import { permanentRedirect } from "next/navigation";
import { productService } from "@/services/product.service";
import { getLocalizedPath } from "@/lib/seo/localized-path";
import type { ProductDetail } from "@/types/api.types";

export const getProductBySlugCached = cache(
  async (slug: string): Promise<ProductDetail | null> => {
    return productService.getBySlug(slug).catch(() => null);
  },
);

export async function resolveProductBySlugParam(
  slug: string,
  locale: string,
): Promise<ProductDetail | null> {
  const product = await getProductBySlugCached(slug);
  if (product) {
    return product;
  }

  const slugRedirectData = await productService.getSlugRedirect(slug).catch(() => null);
  const newSlug = slugRedirectData?.new_slug?.trim();

  if (newSlug && newSlug !== slug) {
    permanentRedirect(getLocalizedPath(locale, `/products/${newSlug}`));
  }

  return null;
}

export function resolveProductPrimaryImage(product: ProductDetail): string | null {
  const media = product.media ?? [];
  const primary = media.find((item) => item.is_primary) ?? media[0];
  const directUrl = primary?.url?.trim();
  if (directUrl) {
    return directUrl;
  }

  const nestedUrl = primary?.image?.url?.trim();
  if (nestedUrl) {
    return nestedUrl;
  }

  const groups = product.media_groups ? Object.values(product.media_groups) : [];
  for (const group of groups) {
    const groupPrimary =
      group.media?.find((item) => item.is_primary || item.is_group_primary) ??
      group.media?.[0];
    const groupUrl = groupPrimary?.url?.trim();
    if (groupUrl) {
      return groupUrl;
    }
  }

  return null;
}
