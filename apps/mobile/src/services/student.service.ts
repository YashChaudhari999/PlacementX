import apiClient from '../lib/apiClient';
import { API_ENDPOINTS } from '../config/api';
import type { StudentProfile, Application, Interview, StudentDocuments, ProfileStatusResponse } from '../types';

export const studentService = {
  getProfile: async () => {
    const response = await apiClient.get<StudentProfile>(API_ENDPOINTS.STUDENT_PROFILE);
    return response.data;
  },

  updateProfile: async (data: Partial<StudentProfile>) => {
    const response = await apiClient.put(API_ENDPOINTS.STUDENT_PROFILE, data);
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
  },

  getProfileStatus: async () => {
    const response = await apiClient.get<ProfileStatusResponse>(API_ENDPOINTS.STUDENT_PROFILE_STATUS);
    return response.data;
  },

  requestProfileUpdate: async (data: Partial<StudentProfile> & { reason?: string }) => {
    const response = await apiClient.put(API_ENDPOINTS.STUDENT_PROFILE_UPDATE_REQUEST, data);
    return response.data;
  },
};

