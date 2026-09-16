import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Role } from '../types';

// Create a custom storage wrapper for Expo SecureStore
const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return AsyncStorage.getItem(name);
      }
      return await SecureStore.getItemAsync(name);
    } catch (e) {
      console.error('SecureStore getItem error:', e);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(name, value);
      } else {
        await SecureStore.setItemAsync(name, value, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
      }
    } catch (e) {
      console.error('SecureStore setItem error:', e);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(name);
      } else {
        await SecureStore.deleteItemAsync(name);
      }
    } catch (e) {
      console.error('SecureStore removeItem error:', e);
    }
  },
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  mustChangePassword?: boolean;
  setAuth: (user: User, token: string, mustChangePassword?: boolean) => void;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      mustChangePassword: false,
      
      setAuth: (user, token, mustChangePassword = false) => 
        set({ user, token, isAuthenticated: true, mustChangePassword }),
        
      logout: async () => {
        try {
          const { useNotificationStore } = require('./notificationStore');
          const { removePushTokenFromBackend } = require('../services/pushNotification.service');
          
          const pushToken = useNotificationStore.getState().pushToken;
          if (pushToken) {
            await removePushTokenFromBackend(pushToken);
            useNotificationStore.getState().setPushToken(null);
          }
          
          const { auth } = require('../lib/firebaseApp');
          const { signOut } = require('firebase/auth');
          if (auth.currentUser) {
             await signOut(auth);
          }
        } catch (error) {
          console.error('Logout cleanup error:', error);
        }
        set({ user: null, token: null, isAuthenticated: false, mustChangePassword: false });
      },
      
      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),
    }),
    {
      name: 'placementx-secure-auth', // new key to avoid conflicts with old AsyncStorage data
      storage: createJSONStorage(() => secureStorage),
    }
  )
);

export type { Role };
