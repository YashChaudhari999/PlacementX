import apiClient from '../lib/apiClient';
import { API_ENDPOINTS } from '../config/api';
import type { Drive, EligibilityResult } from '../types';

export const drivesService = {
  getAdminDrives: async () => {
    const response = await apiClient.get<Drive[]>(API_ENDPOINTS.ADMIN_DRIVES);
    return response.data;
  },

  getPublishedDrives: async () => {
    const response = await apiClient.get<Drive[]>(`${API_ENDPOINTS.ADMIN_DRIVES}?status=PUBLISHED,OPEN`);
    return response.data;
  },

  getDriveDetails: async (id: string) => {
    const response = await apiClient.get<Drive>(API_ENDPOINTS.DRIVE_DETAILS(id));
    return response.data;
  },

  checkEligibility: async (id: string) => {
    const response = await apiClient.get<EligibilityResult>(API_ENDPOINTS.DRIVE_ELIGIBILITY(id));
    return response.data;
  },

  applyForDrive: async (id: string) => {
    // Calling student endpoint for drive application
    const response = await apiClient.post(API_ENDPOINTS.STUDENT_APPLICATIONS, { driveId: id });
    return response.data;
  },

  createDrive: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN_DRIVES, data);
    return response.data;
  }
};
