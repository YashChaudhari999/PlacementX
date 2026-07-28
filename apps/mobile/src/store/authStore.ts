import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setUser: async (user, token) => {
    await AsyncStorage.setItem('placementx_user', JSON.stringify(user));
    await AsyncStorage.setItem('placementx_token', token);
    set({ user, token });
  },

  logout: async () => {
    await AsyncStorage.removeItem('placementx_user');
    await AsyncStorage.removeItem('placementx_token');
    set({ user: null, token: null });
  },

  loadFromStorage: async () => {
    try {
      const userJson = await AsyncStorage.getItem('placementx_user');
      const token = await AsyncStorage.getItem('placementx_token');
      if (userJson && token) {
        set({ user: JSON.parse(userJson), token, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
