import { apiClient } from '@/lib/apiClient';

export const analyticsService = {
  getDashboardAnalytics: async () => {
    const res = await apiClient.get('/admin/analytics');
    return res.data;
  },
};
