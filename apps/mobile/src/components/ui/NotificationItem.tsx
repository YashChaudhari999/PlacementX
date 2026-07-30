// ─── NotificationItem Component ─────────────────────────
// Reusable notification item for the notification center.
// Supports category-based icons, priority badges, relative
// time formatting, and swipe actions.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Briefcase, Calendar, Users, BookOpen, FileText,
  GraduationCap, ShieldAlert, Megaphone, MessageSquare,
  Clock, CreditCard, ShoppingCart, AlertTriangle,
  CheckCircle, XCircle, Shield, Bell,
} from 'lucide-react-native';
import { formatDistanceToNow, isToday, isYesterday, differenceInDays } from 'date-fns';
import { theme } from '../../theme/theme';
import type { Notification, NotificationCategory, NotificationPriority } from '../../types';

// ─── Category Configuration ─────────────────────────────

interface CategoryConfig {
  icon: any;
  color: string;
  bgColor: string;
  label: string;
}

const CATEGORY_CONFIG: Record<NotificationCategory, CategoryConfig> = {
  placement: { icon: Briefcase, color: '#4f46e5', bgColor: '#e0e7ff', label: 'Placement' },
  interview: { icon: Calendar, color: '#9333ea', bgColor: '#f3e8ff', label: 'Interview' },
  meeting: { icon: Users, color: '#0891b2', bgColor: '#cffafe', label: 'Meeting' },
  assignment: { icon: BookOpen, color: '#ea580c', bgColor: '#fff7ed', label: 'Assignment' },
  submission: { icon: FileText, color: '#16a34a', bgColor: '#f0fdf4', label: 'Submission' },
  mentor: { icon: GraduationCap, color: '#ca8a04', bgColor: '#fefce8', label: 'Mentor' },
  admin: { icon: ShieldAlert, color: '#dc2626', bgColor: '#fef2f2', label: 'Admin' },
  announcement: { icon: Megaphone, color: '#2563eb', bgColor: '#eff6ff', label: 'Announcement' },
  message: { icon: MessageSquare, color: '#7c3aed', bgColor: '#f5f3ff', label: 'Message' },
  reminder: { icon: Clock, color: '#d97706', bgColor: '#fffbeb', label: 'Reminder' },
  payment: { icon: CreditCard, color: '#059669', bgColor: '#ecfdf5', label: 'Payment' },
  order: { icon: ShoppingCart, color: '#0284c7', bgColor: '#f0f9ff', label: 'Order' },
  warning: { icon: AlertTriangle, color: '#f59e0b', bgColor: '#fffbeb', label: 'Warning' },
  success: { icon: CheckCircle, color: '#22c55e', bgColor: '#f0fdf4', label: 'Success' },
  error: { icon: XCircle, color: '#ef4444', bgColor: '#fef2f2', label: 'Error' },
  security: { icon: Shield, color: '#dc2626', bgColor: '#fef2f2', label: 'Security' },
  system: { icon: Bell, color: '#64748b', bgColor: '#f1f5f9', label: 'System' },
};

// ─── Priority Colors ────────────────────────────────────

const PRIORITY_STYLES: Record<NotificationPriority, { bg: string; text: string; label: string }> = {
  HIGH: { bg: '#fee2e2', text: '#b91c1c', label: 'HIGH' },
  MEDIUM: { bg: '#fef3c7', text: '#92400e', label: 'MEDIUM' },
  LOW: { bg: '#f1f5f9', text: '#64748b', label: 'LOW' },
};

// ─── Props ──────────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
}

// ─── Component ──────────────────────────────────────────

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onDelete,
  onArchive,
}) => {
  const categoryConfig = CATEGORY_CONFIG[notification.category] || CATEGORY_CONFIG.system;
  const Icon = categoryConfig.icon;
  const isUnread = !notification.isRead;
  const priorityStyle = notification.priority === 'HIGH' ? PRIORITY_STYLES.HIGH : null;

  // Format time
  const createdAt = new Date(notification.createdAt);
  const timeText = formatDistanceToNow(createdAt, { addSuffix: true })
    .replace('about ', '')
    .replace('less than a minute ago', 'just now');

  return (
    <TouchableOpacity
      style={[styles.container, isUnread && styles.unreadContainer]}
      onPress={() => onPress?.(notification)}
      activeOpacity={0.7}
    >
      {/* Unread Indicator Dot */}
      {isUnread && <View style={[styles.unreadDot, { backgroundColor: categoryConfig.color }]} />}

      {/* Category Icon */}
      <View style={[styles.iconBox, { backgroundColor: categoryConfig.bgColor }]}>
        <Icon size={20} color={categoryConfig.color} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[styles.title, isUnread && styles.titleUnread]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text style={styles.time}>{timeText}</Text>
        </View>

        <Text
          style={[styles.message, isUnread && styles.messageUnread]}
          numberOfLines={2}
        >
          {notification.message}
        </Text>

        {/* Priority Badge (only for HIGH) */}
        {priorityStyle && (
          <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
            <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
              {priorityStyle.label} PRIORITY
            </Text>
          </View>
        )}

        {/* Category Tag */}
        <View style={styles.metaRow}>
          <View style={[styles.categoryTag, { backgroundColor: categoryConfig.bgColor }]}>
            <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
              {categoryConfig.label}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Time Grouping Helper ───────────────────────────────

export const getTimeGroup = (dateString: string): string => {
  const date = new Date(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (differenceInDays(new Date(), date) <= 7) return 'Last 7 Days';
  return 'Earlier';
};

// ─── Styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  unreadContainer: {
    backgroundColor: '#f8fafc',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    left: 6,
    top: 22,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginRight: 8,
  },
  titleUnread: {
    fontWeight: '800',
    color: '#0f172a',
  },
  time: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
  },
  message: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 6,
  },
  messageUnread: {
    color: '#475569',
    fontWeight: '500',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
