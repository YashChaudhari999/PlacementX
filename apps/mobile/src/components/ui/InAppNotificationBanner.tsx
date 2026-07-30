// ─── InAppNotificationBanner ────────────────────────────
// Slide-down banner for real-time notifications received
// while the app is in the foreground. Auto-dismisses after
// 4 seconds. Swipe up or tap to interact.

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Bell, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotificationStore } from '../../stores/notificationStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = 80;
const AUTO_DISMISS_MS = 4000;

interface InAppNotificationBannerProps {
  onPress?: (notification: any) => void;
}

export const InAppNotificationBanner: React.FC<InAppNotificationBannerProps> = ({ onPress }) => {
  const insets = useSafeAreaInsets();
  const { bannerQueue, removeFromBannerQueue } = useNotificationStore();
  const slideAnim = useRef(new Animated.Value(-BANNER_HEIGHT - insets.top)).current;
  const [currentNotification, setCurrentNotification] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Show next notification in queue ──────────────
  useEffect(() => {
    if (bannerQueue.length > 0 && !isVisible) {
      const next = bannerQueue[0];
      setCurrentNotification(next);
      setIsVisible(true);
      showBanner();
    }
  }, [bannerQueue, isVisible]);

  // ─── Animation Helpers ────────────────────────────

  const showBanner = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();

    // Auto-dismiss after 4 seconds
    dismissTimer.current = setTimeout(() => {
      hideBanner();
    }, AUTO_DISMISS_MS);
  };

  const hideBanner = () => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }

    Animated.timing(slideAnim, {
      toValue: -BANNER_HEIGHT - insets.top - 20,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      if (currentNotification) {
        removeFromBannerQueue(currentNotification.id);
      }
      setIsVisible(false);
      setCurrentNotification(null);
    });
  };

  const handlePress = () => {
    hideBanner();
    if (currentNotification && onPress) {
      onPress(currentNotification);
    }
  };

  const handleDismiss = () => {
    hideBanner();
  };

  // ─── Render ───────────────────────────────────────

  if (!currentNotification) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.banner}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Icon */}
        <View style={styles.iconBox}>
          <Bell size={20} color="#4f46e5" />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {currentNotification.title}
          </Text>
          <Text style={styles.message} numberOfLines={1}>
            {currentNotification.message}
          </Text>
        </View>

        {/* Dismiss Button */}
        <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss}>
          <X size={16} color="#94a3b8" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar]} />
      </View>
    </Animated.View>
  );
};

// ─── Styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 12,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  dismissBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  progressContainer: {
    height: 3,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginTop: 6,
    marginHorizontal: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4f46e5',
    borderRadius: 2,
    width: '100%',
  },
});
