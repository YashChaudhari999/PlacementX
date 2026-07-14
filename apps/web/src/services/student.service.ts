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
  }
};
