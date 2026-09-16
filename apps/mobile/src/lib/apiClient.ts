import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { API_BASE_URL } from '../config/api';

// Create the axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Get auth token from Zustand store
    const { token } = useAuthStore.getState();

    // 2. Attach Authorization header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return successful responses directly
    return response;
  },
  (error: AxiosError) => {
    // Network Error Detection
    if (!error.response) {
      console.error('[API Network Error]', error.message);
      return Promise.reject(new Error('Network error. Please check your internet connection.'));
    }

    const status = error.response.status;
    const data = error.response.data as any;
    
    // Map backend error messages or fallback
    const backendMessage = data?.message || data?.error || 'An unexpected error occurred';

    console.error(`[API Error ${status}]`, error.config?.url, backendMessage);

    // 401 Unauthorized - Session Expired or Invalid Token
    if (status === 401) {
      console.warn('Session expired. Logging out.');
      useAuthStore.getState().logout();
      return Promise.reject(new Error('Your session has expired. Please log in again.'));
    }
    
    // 403 Forbidden - Role mismatch
    if (status === 403) {
      return Promise.reject(new Error('You do not have permission to perform this action.'));
    }

    // Return the normalized error
    return Promise.reject(new Error(backendMessage));
  }
);

export default apiClient;
