// ─── Deep Link Service ──────────────────────────────────
// Maps notification deep link routes to React Navigation
// actions. Each notification type navigates to its correct screen.

import { notificationsService } from './notifications.service';

// ─── Types ──────────────────────────────────────────────

interface DeepLinkData {
  deepLinkRoute?: string;
  deepLinkParams?: Record<string, any>;
  notificationId?: string;
}

// ─── Route Mapping ──────────────────────────────────────

/**
 * Handle deep link navigation from a notification tap.
 * Marks the notification as read and navigates to the target screen.
 *
 * @param navigation - React Navigation reference
 * @param data - Deep link data from the notification payload
 */
export const handleDeepLink = async (
  navigation: any,
  data: DeepLinkData,
): Promise<void> => {
  // Mark notification as read
  if (data.notificationId) {
    try {
      await notificationsService.markAsRead(data.notificationId);
    } catch (e) {
      // Non-blocking — don't prevent navigation
      console.error('Error marking notification as read:', e);
    }
  }

  const route = data.deepLinkRoute;
  const params = data.deepLinkParams || {};

  if (!route) {
    // No deep link route — navigate to notifications screen
    navigateToNotifications(navigation);
    return;
  }

  // ─── Route Handlers ─────────────────────────────────

  switch (route) {
    // Student Screens
    case 'DriveDetails':
      navigation.navigate('StudentApp', {
        screen: 'HomeStack',
        params: {
          screen: 'DriveDetails',
          params: { id: params.id },
        },
      });
      break;

    case 'Interviews':
      navigation.navigate('StudentApp', {
        screen: 'ProfileStack',
        params: { screen: 'Interviews' },
      });
      break;

    case 'Documents':
      navigation.navigate('StudentApp', {
        screen: 'ProfileStack',
        params: { screen: 'Documents' },
      });
      break;

    case 'Profile':
      navigation.navigate('StudentApp', {
        screen: 'ProfileStack',
        params: { screen: 'ProfileHome' },
      });
      break;

    case 'Dashboard':
      navigation.navigate('StudentApp', {
        screen: 'HomeStack',
        params: { screen: 'Dashboard' },
      });
      break;

    case 'Drives':
      navigation.navigate('StudentApp', {
        screen: 'Drives',
      });
      break;

    case 'StudentSettings':
      navigation.navigate('StudentApp', {
        screen: 'Settings',
      });
      break;

    // Admin Screens
    case 'AdminDashboard':
      navigation.navigate('AdminApp', {
        screen: 'Dashboard',
      });
      break;

    case 'AdminDriveList':
      navigation.navigate('AdminApp', {
        screen: 'DrivesStack',
        params: { screen: 'DriveList' },
      });
      break;

    case 'AdminEventDetails':
      navigation.navigate('AdminApp', {
        screen: 'DrivesStack',
        params: {
          screen: 'EventDetails',
          params: { id: params.id },
        },
      });
      break;

    case 'AdminStudents':
      navigation.navigate('AdminApp', {
        screen: 'Students',
      });
      break;

    case 'AdminCalendar':
      navigation.navigate('AdminApp', {
        screen: 'Calendar',
      });
      break;

    case 'AdminReports':
      navigation.navigate('AdminApp', {
        screen: 'Reports',
      });
      break;

    case 'AdminSettings':
      navigation.navigate('AdminApp', {
        screen: 'Settings',
      });
      break;

    // Shared Screens
    case 'Notifications':
    default:
      navigateToNotifications(navigation);
      break;
  }
};

// ─── Helper ─────────────────────────────────────────────

/**
 * Navigate to the notifications screen based on user role.
 * The navigation structure differs between student (tab) and admin (drawer).
 */
const navigateToNotifications = (navigation: any): void => {
  // Try student navigation first, fall back to admin
  try {
    navigation.navigate('StudentApp', { screen: 'Notifications' });
  } catch {
    try {
      navigation.navigate('AdminApp', { screen: 'Notifications' });
    } catch {
      // Last resort — navigate to root
      console.warn('Could not navigate to notifications screen.');
    }
  }
};
