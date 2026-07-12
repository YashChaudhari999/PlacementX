import api from './api';
import { useAuthStore } from '../stores/authStore';
import type { Role } from '../stores/authStore';

interface LoginCredentials {
  email: string;
  password: string;
  role: Role;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    const { user, token } = response.data;
    useAuthStore.getState().setAuth(user, token);
    return user;
  },

  async logout() {
    // Optional backend logout logic here
    useAuthStore.getState().logout();
  },

  async getMe() {
    const response = await api.get('/auth/me');
    const { user } = response.data;
    useAuthStore.getState().updateUser(user);
    return user;
  }
};
