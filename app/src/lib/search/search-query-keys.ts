import type { SearchFilters } from './types';

export const SEARCH_QUERY_KEYS = {
  all: ['search'] as const,
  results: (filters: SearchFilters, locale?: string) =>
    [...SEARCH_QUERY_KEYS.all, 'results', locale ?? 'en', filters] as const,
  autocomplete: (q: string) => [...SEARCH_QUERY_KEYS.all, 'autocomplete', q] as const,
  infinite: (filters: Omit<SearchFilters, 'page'>, locale?: string) =>
    [...SEARCH_QUERY_KEYS.all, 'infinite', locale ?? 'en', filters] as const,
};
