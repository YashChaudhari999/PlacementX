// ─── usePushNotifications Hook ──────────────────────────
// Initializes push notification infrastructure on app start.
// Handles token registration, foreground/background listeners,
// and notification tap → deep link navigation.

import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import {
  registerForPushNotifications,
  savePushTokenToBackend,
  configureNotificationHandler,
  setupNotificationChannels,
  setBadgeCount,
} from '../services/pushNotification.service';
import { handleDeepLink } from '../services/deepLink.service';
import { getSocketStatus } from '../services/socket.service';

/**
 * Hook that manages the full push notification lifecycle.
 * Should be called once at the root of the app (in App.tsx).
 */
export const usePushNotifications = () => {
  const { isAuthenticated, token } = useAuthStore();
  const { incrementUnreadCount, setPushToken } = useNotificationStore();
  const navigation = useNavigation();

  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // Configure notification behavior
    configureNotificationHandler();

    // Setup Android channels
    setupNotificationChannels();

    // Register for push notifications and save token
    const registerPush = async () => {
      const pushToken = await registerForPushNotifications();
      if (pushToken) {
        await savePushTokenToBackend(pushToken);
        setPushToken(pushToken);
      }
    };
    registerPush();

    // ─── Foreground Notification Listener ──────────────
    // Fires when a notification is received while app is in foreground.
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      if (!getSocketStatus()) incrementUnreadCount();
    });
    
    // ─── Notification Response Listener ───────────────
    // Fires when user taps on a notification (foreground, background, or killed).
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as Record<string, any>;
      if (data?.deepLinkRoute) {
        handleDeepLink(navigation as any, {
          deepLinkRoute: data.deepLinkRoute as string,
          deepLinkParams: data.deepLinkParams as Record<string, any>,
          notificationId: data.notificationId as string,
        });
      }
    });
    
    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [incrementUnreadCount, isAuthenticated, navigation, setPushToken, token]);

  // ─── Handle Last Notification (App Killed State) ────
  // Check if app was opened from a notification tap.
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkLastNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response) {
        const data = response.notification.request.content.data as Record<string, any>;
        if (data?.deepLinkRoute) {
          handleDeepLink(navigation as any, {
            deepLinkRoute: data.deepLinkRoute as string,
            deepLinkParams: data.deepLinkParams as Record<string, any>,
            notificationId: data.notificationId as string,
          });
        }
      }
    };
    checkLastNotification();
  }, [isAuthenticated, navigation]);
};
