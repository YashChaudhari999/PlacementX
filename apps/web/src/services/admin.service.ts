import api from '@/lib/api';

export const adminService = {
  getDashboard: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },
  getPendingProfiles: async () => {
    const res = await api.get('/admin/profile-verifications');
    return res.data;
  },
  verifyProfile: async (id: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    const res = await api.post(`/admin/profile-verifications/${id}/verify`, { action, reason });
    return res.data;
  },
  getUpdateRequests: async () => {
    const res = await api.get('/admin/profile-update-requests');
    return res.data;
  },
  reviewUpdateRequest: async (id: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    const res = await api.post(`/admin/profile-update-requests/${id}/review`, { action, reason });
    return res.data;
  },
  provisionCurrentYearStudents: async () => {
    const res = await api.post('/admin/students/provision');
    return res.data;
  }
};
