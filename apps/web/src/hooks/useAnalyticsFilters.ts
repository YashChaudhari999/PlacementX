import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { AnalyticsFilters } from '../types/analytics.types';

const FILTER_KEYS: (keyof AnalyticsFilters)[] = [
  'academicYear',
  'compareWith',
  'placementSeason',
  'startDate',
  'endDate',
  'department',
  'branch',
  'graduationYear',
  'companyId',
  'companyName',
  'jobRole',
  'driveId',
  'applicationStatus',
  'placementStatus',
  'minSalary',
  'maxSalary',
  'page',
  'pageSize',
  'sortBy',
  'sortOrder',
  'limit',
];

const NUMBER_KEYS = new Set<string>([
  'graduationYear',
  'minSalary',
  'maxSalary',
  'page',
  'pageSize',
  'limit',
]);

/**
 * Manages analytics filter state via URL search params.
 *
 * Usage:
 * ```tsx
 * const { filters, updateFilter, updateFilters, clearFilters } = useAnalyticsFilters();
 * ```
 */
export function useAnalyticsFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: AnalyticsFilters = useMemo(() => {
    const result: AnalyticsFilters = {};
    for (const key of FILTER_KEYS) {
      const value = searchParams.get(key);
      if (value !== null && value !== '') {
        if (NUMBER_KEYS.has(key)) {
          const num = Number(value);
          if (!isNaN(num)) {
            (result as any)[key] = num;
          }
        } else {
          (result as any)[key] = value;
        }
      }
    }
    return result;
  }, [searchParams]);

  const updateFilter = useCallback(
    (key: keyof AnalyticsFilters, value: string | number | undefined) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === undefined || value === '' || value === null) {
            next.delete(String(key));
          } else {
            next.set(String(key), String(value));
          }
          // Reset page when filters change (except for page itself)
          if (key !== 'page' && key !== 'pageSize') {
            next.delete('page');
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const updateFilters = useCallback(
    (updates: Partial<AnalyticsFilters>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === '' || value === null) {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          }
          // Reset page when filters change
          if (!('page' in updates)) {
            next.delete('page');
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const hasActiveFilters = useMemo(() => {
    return FILTER_KEYS.some((key) => searchParams.has(key));
  }, [searchParams]);

  const activeFilterCount = useMemo(() => {
    return FILTER_KEYS.filter((key) => searchParams.has(key)).length;
  }, [searchParams]);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
  };
}
