import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { ProductPageClient } from "./product-page-client";
import type { Locale } from "@/i18n/message-catalog";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { PRODUCT_DETAIL_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";
import { productService } from "@/services/product.service";
import {
  resolveProductBySlugParam,
  resolveProductPrimaryImage,
} from "@/lib/seo/product-by-slug";
import {
  buildCatalogPageMetadata,
  resolveLocalizedSeoValue,
} from "@/lib/seo/page-metadata";
import { SITE_CONFIG } from "@/lib/constants";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const { slug } = await params;
  const product = await resolveProductBySlugParam(slug, locale);

  if (!product) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = resolveLocalizedSeoValue(
    locale,
    product.meta_title_en,
    product.meta_title_ar,
    resolveLocalizedSeoValue(locale, product.name_en, product.name_ar, SITE_CONFIG.name),
  );

  const description = resolveLocalizedSeoValue(
    locale,
    product.meta_description_en,
    product.meta_description_ar,
    resolveLocalizedSeoValue(
      locale,
      product.short_description_en,
      product.short_description_ar,
      resolveLocalizedSeoValue(
        locale,
        product.long_description_en,
        product.long_description_ar,
        SITE_CONFIG.description,
      ),
    ),
  );

  return buildCatalogPageMetadata({
    locale,
    pathnameWithoutLocale: `/products/${product.slug}`,
    title,
    description,
    image: resolveProductPrimaryImage(product),
    openGraphType: "website",
  });
}

export default async function ProductPage({ params }: PageProps) {
  const locale = (await getLocale()) as Locale;
  const { slug } = await params;
  const productData = await resolveProductBySlugParam(slug, locale);

  if (!productData) {
    notFound();
  }

  const linkedProductData = productData.linked_products?.length
    ? (
        await Promise.all(
          productData.linked_products.map((linkedProduct) =>
            productService.getBySlug(linkedProduct.slug).catch(() => null),
          ),
        )
      ).filter(
        (linkedProduct): linkedProduct is NonNullable<typeof linkedProduct> =>
          Boolean(linkedProduct),
      )
    : [];

  const categoryId = productData.categories?.[0]?.id;
  const relatedData = categoryId
    ? await productService
        .getByCategory(categoryId, { limit: 10, in_stock: true })
        .catch(() => null)
    : null;

  return (
    <RouteIntlProvider locale={locale} namespaces={PRODUCT_DETAIL_MESSAGE_NAMESPACES}>
      <ProductPageClient
        slug={slug}
        initialProductData={productData}
        initialRelatedData={relatedData}
        initialLinkedProductData={linkedProductData}
      />
    </RouteIntlProvider>
  );
}
