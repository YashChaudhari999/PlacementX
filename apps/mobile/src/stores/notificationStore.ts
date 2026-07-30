// ─── Notification Store (Zustand) ────────────────────────
// Manages notification state: unread count, badge count,
// and real-time in-app notification banner queue.
// Persisted to AsyncStorage for offline access.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ──────────────────────────────────────────────

interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  priority: string;
  deepLinkRoute?: string;
  deepLinkParams?: Record<string, any>;
  timestamp: number;
}

interface NotificationState {
  // Badge count
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  resetUnreadCount: () => void;

  // In-app notification banner queue
  bannerQueue: InAppNotification[];
  addToBannerQueue: (notification: InAppNotification) => void;
  removeFromBannerQueue: (id: string) => void;
  clearBannerQueue: () => void;

  // Push token
  pushToken: string | null;
  setPushToken: (token: string | null) => void;
}

// ─── Store ──────────────────────────────────────────────

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      // ─── Badge Count ──────────────────────────────────
      unreadCount: 0,
      setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
      incrementUnreadCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
      decrementUnreadCount: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
      resetUnreadCount: () => set({ unreadCount: 0 }),

      // ─── Banner Queue ─────────────────────────────────
      bannerQueue: [],
      addToBannerQueue: (notification) =>
        set((state) => ({
          bannerQueue: [...state.bannerQueue, notification].slice(-10), // Keep last 10
        })),
      removeFromBannerQueue: (id) =>
        set((state) => ({
          bannerQueue: state.bannerQueue.filter((n) => n.id !== id),
        })),
      clearBannerQueue: () => set({ bannerQueue: [] }),

      // ─── Push Token ───────────────────────────────────
      pushToken: null,
      setPushToken: (token) => set({ pushToken: token }),
    }),
    {
      name: 'placementx-notifications',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        unreadCount: state.unreadCount,
        pushToken: state.pushToken,
      }),
    },
  ),
);
