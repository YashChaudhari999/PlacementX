import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Role } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: async () => {
        try {
          const { useNotificationStore } = require('./notificationStore');
          const { removePushTokenFromBackend } = require('../services/pushNotification.service');
          
          const pushToken = useNotificationStore.getState().pushToken;
          if (pushToken) {
            await removePushTokenFromBackend(pushToken);
            useNotificationStore.getState().setPushToken(null);
          }
        } catch (error) {
          console.error('Logout cleanup error:', error);
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),
    }),
    {
      name: 'placementx-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export type { Role };
