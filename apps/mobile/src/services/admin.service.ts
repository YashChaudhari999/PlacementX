import apiClient from '../lib/apiClient';
import { API_ENDPOINTS } from '../config/api';
import type { DashboardData, Coordinator, CalendarEvent } from '../types';

export const adminService = {
  getDashboardData: async () => {
    const response = await apiClient.get<DashboardData>(API_ENDPOINTS.ADMIN_DASHBOARD);
    return response.data;
  },

  getStudents: async () => {
    // Assuming it returns an array of any for now, could define a specific AdminStudent type
    const response = await apiClient.get<any[]>(API_ENDPOINTS.ADMIN_STUDENTS);
    return response.data;
  },

  getCoordinators: async () => {
    const response = await apiClient.get<Coordinator[]>(API_ENDPOINTS.ADMIN_COORDINATORS);
    return response.data;
  },

  addCoordinator: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN_COORDINATORS, data);
    return response.data;
  },

  getCalendarEvents: async () => {
    const response = await apiClient.get<{ events: CalendarEvent[]; summary: any; semester: any }>(API_ENDPOINTS.ADMIN_CALENDAR);
    return response.data;
  },

  getReportsData: async () => {
    const response = await apiClient.get<any>(API_ENDPOINTS.ADMIN_REPORTS_DATA);
    return response.data;
  }
};
