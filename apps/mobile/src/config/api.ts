import { Platform } from 'react-native';

/**
 * API Configuration
 *
 * Android emulator uses 10.0.2.2 to reach host machine's localhost.
 * iOS simulator can use localhost directly.
 * For physical devices, replace with your machine's LAN IP.
 */
const getBaseUrl = (): string => {
  if (__DEV__) {
    // Using LAN IP to ensure it works on physical devices (Expo Go) as well as emulators
    return 'http://192.168.1.3:5000/api';
  }
  // In production, replace with your actual API URL
  return 'https://api.placementx.com/api';
};

export const API_BASE_URL = getBaseUrl();

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  FIREBASE_LOGIN: '/auth/firebase-login',
  ME: '/auth/me',
  CHANGE_PASSWORD: '/auth/password',

  // Public
  PUBLIC_STATS: '/public/stats',

  // Student
  STUDENT_PROFILE: '/student/profile',
  STUDENT_APPLICATIONS: '/student/applications',
  STUDENT_INTERVIEWS: '/student/interviews',
  STUDENT_DOCUMENTS: '/student/documents',

  // Drives
  ADMIN_DRIVES: '/admin/drives',
  DRIVE_DETAILS: (id: string) => `/admin/drives/${id}`,
  DRIVE_ELIGIBILITY: (id: string) => `/admin/drives/${id}/eligibility`,
  DRIVE_APPLICATIONS: (id: string) => `/admin/drives/${id}/applications`,
  DRIVE_APPLICATION_STATUS: (appId: string) => `/admin/drives/applications/${appId}/status`,
  DRIVE_APPROVE: (id: string) => `/admin/drives/${id}/approve`,
  DRIVE_REJECT: (id: string) => `/admin/drives/${id}/reject`,
  DRIVE_REQUEST_CHANGES: (id: string) => `/admin/drives/${id}/request-changes`,

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_STUDENTS_IMPORT: '/admin/students/import',
  ADMIN_COORDINATORS: '/admin/coordinators',
  ADMIN_CALENDAR: '/admin/calendar',
  ADMIN_REPORTS_DATA: '/admin/reports/data',
  ADMIN_ANALYTICS_SUMMARY: '/admin/analytics/summary',
  ADMIN_ANALYTICS_CHARTS: '/admin/analytics/charts',

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_UNREAD_COUNT: '/notifications/unread-count',
  NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
  NOTIFICATION_READ_ALL: '/notifications/read-all',
  NOTIFICATION_ARCHIVE: (id: string) => `/notifications/${id}/archive`,
  NOTIFICATION_DELETE: (id: string) => `/notifications/${id}`,
  NOTIFICATION_PREFERENCES: '/notifications/preferences',
  NOTIFICATION_REGISTER_DEVICE: '/notifications/register-device',
  NOTIFICATION_REMOVE_DEVICE: '/notifications/remove-device',
  NOTIFICATION_BROADCAST: '/notifications/broadcast',
  NOTIFICATION_SCHEDULE: '/notifications/schedule',

  // HR
  HR_DRIVE: (token: string) => `/hr/drive/${token}`,
} as const;
