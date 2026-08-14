import api from '@/lib/api';

export const driveService = {
  getAllDrives: async () => {
    const res = await api.get('/admin/drives');
    return res.data;
  },
  getDriveDetails: async (id: string) => {
    const res = await api.get(`/admin/drives/${id}`);
    return res.data;
  },
};
