// ─── Push Notification Service (Mobile) ─────────────────
// Handles Expo push notification registration, permission
// requests, token management, and notification listeners.

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import apiClient from '../lib/apiClient';
import { API_ENDPOINTS } from '../config/api';

const AndroidImportance = { DEFAULT: Notifications.AndroidImportance.DEFAULT, HIGH: Notifications.AndroidImportance.HIGH, MAX: Notifications.AndroidImportance.MAX };

// ─── Notification Channel Setup (Android) ───────────────

/**
 * Create Android notification channels for different notification types.
 * Each channel maps to a notification category with appropriate importance.
 */
export const setupNotificationChannels = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;

  const channels = [
    { id: 'default', name: 'General', importance: AndroidImportance.DEFAULT },
    { id: 'placement', name: 'Placement Drives', importance: AndroidImportance.HIGH },
    { id: 'interview', name: 'Interviews', importance: AndroidImportance.MAX },
    { id: 'meeting', name: 'Meetings', importance: AndroidImportance.HIGH },
    { id: 'assignment', name: 'Assignments', importance: AndroidImportance.DEFAULT },
    { id: 'reminder', name: 'Reminders', importance: AndroidImportance.HIGH },
    { id: 'messages', name: 'Messages', importance: AndroidImportance.DEFAULT },
    { id: 'payment', name: 'Payments', importance: AndroidImportance.HIGH },
    { id: 'security', name: 'Security Alerts', importance: AndroidImportance.MAX },
  ];

  for (const channel of channels) {
    await Notifications.setNotificationChannelAsync(channel.id, {
      name: channel.name,
      importance: channel.importance,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
};

// ─── Notification Handler Configuration ─────────────────

/**
 * Configure how notifications are handled when received in foreground.
 */
export const configureNotificationHandler = (): void => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

// ─── Push Token Registration ────────────────────────────

/**
 * Request notification permissions and get the Expo push token.
 * Returns the push token string or null if permissions denied.
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  try {
    if (Constants.appOwnership === 'expo') {
      console.log('Push notifications (remote) are not supported in Expo Go SDK 53+. Using mock token.');
      return 'ExponentPushToken[mock-token-for-expo-go]';
    }

    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    return token;
  } catch (error) {
    console.error('Error getting Expo push token:', error);
    return null;
  }
};

// ─── Backend Token Registration ─────────────────────────

/**
 * Register the push token with the backend for this device.
 */
export const savePushTokenToBackend = async (token: string): Promise<void> => {
  try {
    await apiClient.post(API_ENDPOINTS.NOTIFICATION_REGISTER_DEVICE, {
      token,
      platform: Platform.OS,
      deviceName: Device.modelName || `${Platform.OS} device`,
    });
    console.log('Push token registered with backend.');
  } catch (error) {
    console.error('Error saving push token to backend:', error);
  }
};

/**
 * Remove the push token from the backend (on logout).
 */
export const removePushTokenFromBackend = async (token: string): Promise<void> => {
  try {
    await apiClient.delete(API_ENDPOINTS.NOTIFICATION_REMOVE_DEVICE, {
      data: { token },
    });
    console.log('Push token removed from backend.');
  } catch (error) {
    console.error('Error removing push token from backend:', error);
  }
};

// ─── Badge Management ───────────────────────────────────

/**
 * Set the app icon badge count.
 */
export const setBadgeCount = async (count: number): Promise<void> => {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    // Badge count not supported on all platforms
  }
};

/**
 * Clear the app icon badge count.
 */
export const clearBadgeCount = async (): Promise<void> => {
  await setBadgeCount(0);
};
