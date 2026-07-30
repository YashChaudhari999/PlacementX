// ─── Push Notification Service (Mobile) ─────────────────
// Handles Expo push notification registration, permission
// requests, token management, and notification listeners.

// import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import apiClient from '../lib/apiClient';
import { API_ENDPOINTS } from '../config/api';

// Mock AndroidImportance for compilation
const AndroidImportance = { DEFAULT: 3, HIGH: 4, MAX: 5 };

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
    // Mock setNotificationChannelAsync
  }
};

// ─── Notification Handler Configuration ─────────────────

/**
 * Configure how notifications are handled when received in foreground.
 */
export const configureNotificationHandler = (): void => {
  // Mock setNotificationHandler
};

// ─── Push Token Registration ────────────────────────────

/**
 * Request notification permissions and get the Expo push token.
 * Returns the push token string or null if permissions denied.
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  // Mocked out for Expo Go development
  console.log('Push notifications mocked for Expo Go');
  return null;
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
    // Mock setBadgeCountAsync
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
