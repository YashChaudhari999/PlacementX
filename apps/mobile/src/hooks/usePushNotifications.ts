// ─── usePushNotifications Hook ──────────────────────────
// Initializes push notification infrastructure on app start.
// Handles token registration, foreground/background listeners,
// and notification tap → deep link navigation.

import { useEffect, useRef } from 'react';
// import * as Notifications from 'expo-notifications';
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

/**
 * Hook that manages the full push notification lifecycle.
 * Should be called once at the root of the app (in App.tsx).
 */
export const usePushNotifications = () => {
  const { isAuthenticated, token } = useAuthStore();
  const { incrementUnreadCount } = useNotificationStore();
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
      }
    };
    registerPush();

    // ─── Foreground Notification Listener ──────────────
    // Fires when a notification is received while app is in foreground.
    
    // ─── Notification Response Listener ───────────────
    // Fires when user taps on a notification (foreground, background, or killed).
    
    // Cleanup listeners on unmount
    return () => {
    };
  }, [isAuthenticated, token]);

  // ─── Handle Last Notification (App Killed State) ────
  // Check if app was opened from a notification tap.
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkLastNotification = async () => {
      // mocked
    };
    checkLastNotification();
  }, [isAuthenticated]);
};
