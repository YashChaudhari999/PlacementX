/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/api';

export const studentService = {
  getProfile: async (userId: string) => {
    if (!userId) return null;
    const res = await api.get('/student/profile', {});
    return res.data;
  },
  updateProfile: async (userId: string, data: any) => {
    const res = await api.put('/student/profile', data);
    return res.data;
  },
  updatePhoto: async (userId: string, photoUrl: string) => {
    const res = await api.put('/student/profile/photo', { photoUrl });
    return res.data;
  },
  getProfileStatus: async () => {
    const res = await api.get('/student/profile/status');
    return res.data;
  },
  requestProfileUpdate: async (data: any) => {
    const res = await api.put('/student/profile/update-request', data);
    return res.data;
  },
  getMLPrediction: async (userId: string, profileData: any) => {
    if (!userId) return null;
    try {
      const res = await api.post(`/student/${userId}/ml-predict`, profileData, {});
      return res.data;
    } catch {
      return null;
    }
  },
};
