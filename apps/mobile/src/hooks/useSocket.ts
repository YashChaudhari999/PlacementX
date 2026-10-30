// ─── useSocket Hook ─────────────────────────────────────
// Manages Socket.IO lifecycle and real-time notification
// cache invalidation via React Query.

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import {
  connectSocket,
  disconnectSocket,
  onNewNotification,
  onCountUpdate,
  onNotificationUpdate,
  onDataChanged,
  onSocketConnected,
} from '../services/socket.service';

/**
 * Hook that manages Socket.IO connection and automatically
 * invalidates React Query caches on real-time notification events.
 * Should be called once at the root of the app.
 */
export const useSocket = () => {
  const { isAuthenticated, token } = useAuthStore();
  const { setUnreadCount, incrementUnreadCount } = useNotificationStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectSocket();
      return;
    }

    // Connect socket with JWT auth
    connectSocket();

    // ─── Real-Time Event Handlers ───────────────────

    // New notification received — update store + invalidate cache
    const unsubNew = onNewNotification((notification) => {
      // Increment local unread count immediately
      incrementUnreadCount();

      // Invalidate React Query notification cache for instant UI update
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    // Unread count update — sync badge count
    const unsubCount = onCountUpdate(({ count }) => {
      setUnreadCount(count);
    });

    // Generic update event — refetch notifications
    const unsubUpdate = onNotificationUpdate(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    });

    // Keep every mobile screen in sync with mutations from web, admin, HR,
    // background jobs, or another signed-in device.
    const unsubDataChanged = onDataChanged(() => {
      queryClient.invalidateQueries();
    });

    // Reconcile after reconnecting because events may have been missed while
    // the app was backgrounded or the device was offline.
    const unsubConnected = onSocketConnected(() => {
      queryClient.invalidateQueries();
    });

    // Cleanup on unmount or auth change
    return () => {
      unsubNew();
      unsubCount();
      unsubUpdate();
      unsubDataChanged();
      unsubConnected();
      disconnectSocket();
    };
  }, [isAuthenticated, token]);
};
