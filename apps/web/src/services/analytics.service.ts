import api from '@/lib/api';

export const analyticsService = {
  getOverview: async (params?: any) => {
    const res = await api.get('/admin/analytics/placement/overview', { params });
    return res.data;
  },
  getDepartments: async (params?: any) => {
    const res = await api.get('/admin/analytics/placement/departments', { params });
    return res.data;
  },
  getYearComparison: async (params?: any) => {
    const res = await api.get('/admin/analytics/placement/year-comparison', { params });
    return res.data;
  },
  getPackages: async (params?: any) => {
    const res = await api.get('/admin/analytics/placement/packages', { params });
    return res.data;
  },
  getCompanies: async (params?: any) => {
    const res = await api.get('/admin/analytics/placement/companies', { params });
    return res.data;
  },
  getFunnel: async (params?: any) => {
    const res = await api.get('/admin/analytics/placement/funnel', { params });
    return res.data;
  },
  getIntelligence: async (params?: any) => {
    const res = await api.get('/admin/analytics/placement/intelligence', { params });
    return res.data;
  }
};
