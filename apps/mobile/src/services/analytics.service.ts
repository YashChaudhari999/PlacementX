import apiClient from '../lib/apiClient';
import { API_ENDPOINTS } from '../config/api';

export const analyticsService = {
  getSummary: async () => {
    const response = await apiClient.get<any>(API_ENDPOINTS.ADMIN_ANALYTICS_SUMMARY);
    return response.data;
  },

  getCharts: async () => {
    const response = await apiClient.get<any>(API_ENDPOINTS.ADMIN_ANALYTICS_CHARTS);
    return response.data;
  },
  
  getPublicStats: async () => {
    const response = await apiClient.get<any>(API_ENDPOINTS.PUBLIC_STATS);
    return response.data;
  }
};
