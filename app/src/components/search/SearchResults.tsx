'use client';

import { useLocale, useTranslations } from 'next-intl';
import { SearchSkeleton } from './SearchSkeleton';
import type { SearchHit } from '@/lib/search/types';
import { ResponsiveGrid } from '@/components/ui';
import { ProductCard } from '@/components/products';
import type { Product } from '@/types';

const FALLBACK_TIMESTAMP = '1970-01-01T00:00:00.000Z';

function mapSearchHitToProduct(hit: SearchHit, locale: string): Product {
  return {
    id: hit.id,
    name: locale === 'ar' ? hit.name_ar : hit.name_en,
    nameAr: hit.name_ar,
    slug: hit.slug?.trim() || '',
    description: '',
    descriptionAr: '',
    price: hit.sale_price ?? hit.price,
    compareAtPrice: hit.sale_price != null && hit.sale_price < hit.price ? hit.price : undefined,
    images: hit.images ?? [],
    category: {
      id: hit.category || 'search-category',
      name: hit.category || '',
      slug: hit.category || 'search-category',
    },
    brand: hit.brand
      ? {
          id: hit.brand,
          name: hit.brand,
          slug: hit.brand,
        }
      : undefined,
    tags: [],
    stock: hit.stock ?? 0,
    sku: '',
    rating: hit.rating ?? 0,
    reviewCount: 0,
    isFeatured: false,
    isNew: false,
    createdAt: hit.createdAt ?? FALLBACK_TIMESTAMP,
    updatedAt: hit.createdAt ?? FALLBACK_TIMESTAMP,
  };
}

interface Props {
  hits: SearchHit[];
  isLoading: boolean;
}

export function SearchResults({ hits, isLoading }: Props) {
  const locale = useLocale();
  const t = useTranslations('search');

  if (isLoading) return <SearchSkeleton />;

  if (!hits.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noResults')}</h3>
        <p className="text-sm text-gray-500">
          {t('noResultsHint')}
        </p>
      </div>
    );
  }

  return (
    <ResponsiveGrid>
      {hits.map((hit) => (
        <ProductCard
          key={hit.id}
          product={mapSearchHitToProduct(hit, locale)}
          cartButtonVariant="floating"
          cartButtonColor="white"
          cartButtonIcon="add-to-cart"
        />
      ))}
    </ResponsiveGrid>
  );
}
