import axios from 'axios';

// Android emulator uses 10.0.2.2 to reach host machine's localhost
// For physical device, change this to your machine's local IP e.g. http://192.168.1.x:5000
export const API_URL = 'http://10.0.2.2:5000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach user-id header automatically for all requests
api.interceptors.request.use((config) => {
  return config;
});

export default api;
