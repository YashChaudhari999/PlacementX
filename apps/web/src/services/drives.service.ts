import { apiClient } from '@/lib/apiClient';

export const driveService = {
  getAllDrives: async () => {
    const res = await apiClient.get('/admin/drives');
    return res.data;
  },
  getDriveDetails: async (id: string) => {
    const res = await apiClient.get(`/admin/drives/${id}`);
    return res.data;
  },
};
