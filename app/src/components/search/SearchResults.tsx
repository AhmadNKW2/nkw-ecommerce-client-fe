'use client';

import { useTranslations } from 'next-intl';
import { SearchProductCard } from './SearchProductCard';
import { SearchSkeleton } from './SearchSkeleton';
import type { SearchHit } from '@/lib/search/types';
import { ResponsiveGrid } from '@/components/ui';

interface Props {
  hits: SearchHit[];
  isLoading: boolean;
}

export function SearchResults({ hits, isLoading }: Props) {
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
        <SearchProductCard key={hit.id} hit={hit} />
      ))}
    </ResponsiveGrid>
  );
}
