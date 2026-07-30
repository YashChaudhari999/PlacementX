// ─── Notification Provider ──────────────────────────────
// Root wrapper that initializes push notifications, socket
// connection, and renders the in-app banner for foreground alerts.

import React from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useSocket } from '../hooks/useSocket';
import { InAppNotificationBanner } from '../components/ui/InAppNotificationBanner';
import { useNavigation } from '@react-navigation/native';
import { handleDeepLink } from '../services/deepLink.service';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const navigation = useNavigation();

  // Initialize infrastructure
  usePushNotifications();
  useSocket();

  // Handle banner tap
  const handleBannerPress = (notification: any) => {
    handleDeepLink(navigation as any, {
      deepLinkRoute: notification.deepLinkRoute,
      deepLinkParams: notification.deepLinkParams,
      notificationId: notification.id,
    });
  };

  return (
    <>
      {children}
      <InAppNotificationBanner onPress={handleBannerPress} />
    </>
  );
};
