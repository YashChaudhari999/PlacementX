import apiClient from '../lib/apiClient';
import { API_ENDPOINTS } from '../config/api';
import type { StudentProfile, Application, Interview, StudentDocuments } from '../types';

export const studentService = {
  getProfile: async (userId: string) => {
    const response = await apiClient.get<StudentProfile>(API_ENDPOINTS.STUDENT_PROFILE, {
      headers: { 'x-user-id': userId }
    });
    return response.data;
  },

  updateProfile: async (userId: string, data: Partial<StudentProfile>) => {
    const response = await apiClient.put(API_ENDPOINTS.STUDENT_PROFILE, data, {
      headers: { 'x-user-id': userId }
    });
    return response.data;
  },

  getApplications: async () => {
    const response = await apiClient.get<Application[]>(API_ENDPOINTS.STUDENT_APPLICATIONS);
    return response.data;
  },

  getInterviews: async () => {
    const response = await apiClient.get<Interview[]>(API_ENDPOINTS.STUDENT_INTERVIEWS);
    return response.data;
  },

  getDocuments: async () => {
    const response = await apiClient.get<StudentDocuments>(API_ENDPOINTS.STUDENT_DOCUMENTS);
    return response.data;
  }
};
