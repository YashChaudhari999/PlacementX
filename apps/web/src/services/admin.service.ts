import api from '@/lib/api';

export const adminService = {
  getDashboard: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },
};
