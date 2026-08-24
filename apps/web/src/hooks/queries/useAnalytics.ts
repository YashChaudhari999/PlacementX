import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../../services/analytics.service';
import type { AnalyticsFilters } from '../../types/analytics.types';

const STALE = 60_000;

export const useFilterOptions = () =>
  useQuery({
    queryKey: ['analytics', 'filterOptions'],
    queryFn: () => analyticsService.getFilterOptions(),
    staleTime: 5 * 60_000,
  });

export const useAnalyticsOverview = (params?: AnalyticsFilters) =>
  useQuery({
    queryKey: ['analytics', 'overview', params],
    queryFn: () => analyticsService.getOverview(params),
    staleTime: STALE,
  });

export const useHealthScore = (params?: AnalyticsFilters) =>
  useQuery({
    queryKey: ['analytics', 'healthScore', params],
    queryFn: () => analyticsService.getHealthScore(params),
    staleTime: STALE,
  });

export const useAnalyticsFunnel = (params?: AnalyticsFilters) =>
  useQuery({
    queryKey: ['analytics', 'funnel', params],
    queryFn: () => analyticsService.getFunnel(params),
    staleTime: STALE,
  });

export const useAnalyticsDepartments = (params?: AnalyticsFilters) =>
  useQuery({
    queryKey: ['analytics', 'departments', params],
    queryFn: () => analyticsService.getDepartments(params),
    staleTime: STALE,
  });

export const useAnalyticsCompanies = (params?: AnalyticsFilters) =>
  useQuery({
    queryKey: ['analytics', 'companies', params],
    queryFn: () => analyticsService.getCompanies(params),
    staleTime: STALE,
  });

export const useAnalyticsPackages = (params?: AnalyticsFilters) =>
  useQuery({
    queryKey: ['analytics', 'packages', params],
    queryFn: () => analyticsService.getPackages(params),
    staleTime: STALE,
  });

export const useAnalyticsYearComparison = (params?: AnalyticsFilters) =>
  useQuery({
    queryKey: ['analytics', 'yearComparison', params],
    queryFn: () => analyticsService.getYearComparison(params),
    staleTime: STALE,
  });

export const useStudentRiskAnalytics = (params?: AnalyticsFilters) =>
  useQuery({
    queryKey: ['analytics', 'studentRisk', params],
    queryFn: () => analyticsService.getStudentRisk(params),
    staleTime: STALE,
  });

export const useSkillGapAnalytics = (params?: AnalyticsFilters) =>
  useQuery({
    queryKey: ['analytics', 'skillGap', params],
    queryFn: () => analyticsService.getSkillGap(params),
    staleTime: STALE,
  });

export const useDriveAnalytics = (params?: AnalyticsFilters) =>
  useQuery({
    queryKey: ['analytics', 'drives', params],
    queryFn: () => analyticsService.getDriveAnalytics(params),
    staleTime: STALE,
  });

export const useAnalyticsIntelligence = (params?: AnalyticsFilters) =>
  useQuery({
    queryKey: ['analytics', 'intelligence', params],
    queryFn: () => analyticsService.getIntelligence(params),
    staleTime: STALE,
  });

export const useActionCenter = (params?: AnalyticsFilters) =>
  useQuery({
    queryKey: ['analytics', 'actionCenter', params],
    queryFn: () => analyticsService.getActionCenter(params),
    staleTime: STALE,
  });

export const useOperationalHealth = () =>
  useQuery({
    queryKey: ['analytics', 'operational'],
    queryFn: () => analyticsService.getOperational(),
    staleTime: STALE,
  });

export const useForecast = (params?: AnalyticsFilters) =>
  useQuery({
    queryKey: ['analytics', 'forecast', params],
    queryFn: () => analyticsService.getForecast(params),
    staleTime: STALE,
  });
