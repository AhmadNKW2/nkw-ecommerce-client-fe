'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { clientSearch } from './api';
import { SEARCH_QUERY_KEYS } from './search-query-keys';
import type { SearchFilters, SearchResponse } from './types';

export { SEARCH_QUERY_KEYS } from './search-query-keys';

export function useSearch(filters: SearchFilters, initialData?: SearchResponse | null, options?: { locale?: string }) {
  return useQuery({
    queryKey: SEARCH_QUERY_KEYS.results(filters, options?.locale),
    queryFn: () => clientSearch(filters, options?.locale),
    initialData: initialData ?? undefined,
    staleTime: 30_000, // 30s
  });
}

export function isWildcardBrowseQuery(q?: string): boolean {
  const normalized = typeof q === 'string' ? q.trim() : '';
  return !normalized || normalized === '*';
}

export function useInfiniteSearchProducts(
  filters: Omit<SearchFilters, 'page'>,
  options?: {
    enabled?: boolean,
    initialData?: { pages: SearchResponse[]; pageParams: number[] },
    locale?: string,
    refetchOnMount?: boolean | 'always',
  }
) {
  return useInfiniteQuery({
    queryKey: SEARCH_QUERY_KEYS.infinite(filters, options?.locale),
    queryFn: ({ pageParam = 1 }) => clientSearch({ ...filters, page: pageParam }, options?.locale),
    initialPageParam: 1,
    initialData: options?.initialData as any,
    enabled: options?.enabled,
    staleTime: 30_000,
    refetchOnMount: options?.refetchOnMount ?? false,
    placeholderData: (previousData) => previousData,
    getNextPageParam: (lastPage) => {
      const page = lastPage.page || 1;
      const totalPages = lastPage.total_pages || 1;
      return page < totalPages ? page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      const page = firstPage.page || 1;
      return page > 1 ? page - 1 : undefined;
    },
  });
}

