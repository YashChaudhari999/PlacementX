import api from '@/lib/api';

export const analyticsService = {
  getSummary: async (params: any) => {
    const res = await api.get('/admin/analytics/summary', { params });
    return res.data;
  },
  getCharts: async (params: any) => {
    const res = await api.get('/admin/analytics/charts', { params });
    return res.data;
  },
  getAiInsights: async (params: any) => {
    const res = await api.get('/admin/analytics/ai-insights', { params });
    return res.data;
  },
};
