import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { API_BASE_URL } from '../config/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For admin/student specific endpoints that might need user ID
    // Some web endpoints use x-user-id header
    const user = useAuthStore.getState().user;
    if (user) {
      config.headers['x-user-id'] = user.id;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on unauthorized
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
