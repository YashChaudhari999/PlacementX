import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Android emulator uses 10.0.2.2 to reach host machine's localhost
// For physical device, change this to your machine's local IP e.g. http://192.168.1.x:5000
export const API_URL = 'http://10.0.2.2:5000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token automatically for all requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
