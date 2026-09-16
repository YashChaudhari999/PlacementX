import api from '@/lib/api';

export const getSettings = async () => {
 const { data } = await api.get('/student/settings');
 return data;
};

export const updateProfilePreferences = async (payload: any) => {
 const { data } = await api.put('/student/settings/profile-preferences', payload);
 return data;
};

export const updatePrivacy = async (payload: any) => {
 const { data } = await api.put('/student/settings/privacy', payload);
 return data;
};

export const updateCalendar = async (payload: any) => {
 const { data } = await api.put('/student/settings/calendar', payload);
 return data;
};

export const updateRegional = async (payload: any) => {
 const { data } = await api.put('/student/settings/regional', payload);
 return data;
};

export const updateNotifications = async (payload: any) => {
 const { data } = await api.put('/student/settings/notifications', payload);
 return data;
};

export const getDevices = async () => {
 const { data } = await api.get('/student/settings/devices');
 return data;
};

export const deleteDevice = async (id: string) => {
 const { data } = await api.delete(`/student/settings/devices/${id}`);
 return data;
};

export const submitSupportRequest = async (payload: any) => {
 const { data } = await api.post('/student/settings/support', payload);
 return data;
};

export const requestDeactivation = async () => {
 const { data } = await api.post('/student/settings/deactivation-request');
 return data;
};

export const exportData = async () => {
 const { data } = await api.post('/student/settings/data-export');
 return data;
};
