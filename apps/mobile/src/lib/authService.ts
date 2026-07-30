import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import type { LoginCredentials, User } from '../types';

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<{ user: User; token: string }>(
      API_ENDPOINTS.LOGIN,
      credentials
    );
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get<User>(API_ENDPOINTS.ME);
    return response.data;
  },
};
