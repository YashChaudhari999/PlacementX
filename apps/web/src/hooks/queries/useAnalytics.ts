import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../../services/analytics.service';

export const useAnalyticsOverview = (params?: any) => {
  return useQuery({
    queryKey: ['analytics', 'overview', params],
    queryFn: () => analyticsService.getOverview(params),
    staleTime: 60000,
  });
};

export const useAnalyticsDepartments = (params?: any) => {
  return useQuery({
    queryKey: ['analytics', 'departments', params],
    queryFn: () => analyticsService.getDepartments(params),
    staleTime: 60000,
  });
};

export const useAnalyticsYearComparison = (params?: any) => {
  return useQuery({
    queryKey: ['analytics', 'yearComparison', params],
    queryFn: () => analyticsService.getYearComparison(params),
    staleTime: 60000,
  });
};

export const useAnalyticsPackages = (params?: any) => {
  return useQuery({
    queryKey: ['analytics', 'packages', params],
    queryFn: () => analyticsService.getPackages(params),
    staleTime: 60000,
  });
};

export const useAnalyticsCompanies = (params?: any) => {
  return useQuery({
    queryKey: ['analytics', 'companies', params],
    queryFn: () => analyticsService.getCompanies(params),
    staleTime: 60000,
  });
};

export const useAnalyticsFunnel = (params?: any) => {
  return useQuery({
    queryKey: ['analytics', 'funnel', params],
    queryFn: () => analyticsService.getFunnel(params),
    staleTime: 60000,
  });
};

export const useAnalyticsIntelligence = (params?: any) => {
  return useQuery({
    queryKey: ['analytics', 'intelligence', params],
    queryFn: () => analyticsService.getIntelligence(params),
    staleTime: 60000,
  });
};
