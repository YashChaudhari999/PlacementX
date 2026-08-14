import { apiClient } from '@/lib/apiClient';

export const studentService = {
  getProfile: async (userId: string) => {
    if (!userId) return null;
    const res = await apiClient.get('/student/profile', {
      headers: { 'x-user-id': userId }
    });
    return res.data;
  },
  updateProfile: async (userId: string, data: any) => {
    const res = await apiClient.put('/student/profile', data, {
      headers: { 'x-user-id': userId }
    });
    return res.data;
  },
  getMLPrediction: async (userId: string, profileData: any) => {
    if (!userId) return null;
    try {
      const res = await apiClient.post(`/student/${userId}/ml-predict`, profileData, {
        headers: { 'x-user-id': userId }
      });
      return res.data;
    } catch {
      return null;
    }
  }
};
