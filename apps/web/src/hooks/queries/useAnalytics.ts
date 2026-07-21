import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';

export const useAnalyticsSummary = (params: any) => {
  return useQuery({
    queryKey: ['analytics', 'summary', params],
    queryFn: () => analyticsService.getSummary(params),
    refetchInterval: 60000,
  });
};

export const useAnalyticsCharts = (params: any) => {
  return useQuery({
    queryKey: ['analytics', 'charts', params],
    queryFn: () => analyticsService.getCharts(params),
    refetchInterval: 60000,
  });
};

export const useAnalyticsAiInsights = (params: any) => {
  return useQuery({
    queryKey: ['analytics', 'ai-insights', params],
    queryFn: () => analyticsService.getAiInsights(params),
    refetchInterval: 60000,
  });
};
