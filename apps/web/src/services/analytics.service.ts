import { apiClient } from '@/lib/apiClient';

export const analyticsService = {
  getSummary: async (params: any) => {
    const res = await apiClient.get('/admin/analytics/summary', { params });
    return res.data;
  },
  getCharts: async (params: any) => {
    const res = await apiClient.get('/admin/analytics/charts', { params });
    return res.data;
  },
  getAiInsights: async (params: any) => {
    const res = await apiClient.get('/admin/analytics/ai-insights', { params });
    return res.data;
  },
};
