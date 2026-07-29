import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Briefcase, Bell, Check, ExternalLink } from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { theme } from '../../theme/theme';

export const DashboardScreen = () => {
  // Dummy data to mimic the web hooks for MVP UI preview
  const user = { email: 'student@example.com' };
  const drives = [
    {
      id: '1',
      company: { name: 'Google' },
      jobRole: 'Software Engineer',
      fixedSalary: '25',
      employmentType: 'Full Time',
      registrationEnd: new Date().toISOString(),
    },
    {
      id: '2',
      company: { name: 'Microsoft' },
      jobRole: 'Frontend Developer',
      fixedSalary: '20',
      employmentType: 'Full Time',
      registrationEnd: new Date().toISOString(),
    }
  ];
  const notifications = [
    {
      id: '1',
      title: 'Drive Shortlist',
      message: 'You have been shortlisted for Google.',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Assessment Link',
      message: 'Assessment link for Microsoft has been sent.',
      isRead: true,
      createdAt: new Date().toISOString(),
    }
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user.email}</Text>
        <Text style={styles.subtitle}>Here is your placement dashboard.</Text>
      </View>

      <Card style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Briefcase color={theme.colors.primary} size={20} />
          <Text style={styles.cardTitle}>Active Drives</Text>
        </View>

        <View style={styles.list}>
          {drives.length === 0 ? (
            <Text style={styles.emptyText}>No active drives available right now.</Text>
          ) : (
            drives.map(drive => (
              <View key={drive.id} style={styles.driveItem}>
                <View style={styles.driveHeader}>
                  <View>
                    <Text style={styles.companyName}>{drive.company.name}</Text>
                    <Text style={styles.jobRole}>{drive.jobRole}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{drive.fixedSalary ? `${drive.fixedSalary} LPA` : 'TBD'}</Text>
                  </View>
                </View>

                <View style={styles.driveDetails}>
                  <Text style={styles.detailText}><Text style={styles.bold}>Type:</Text> {drive.employmentType}</Text>
                  <Text style={styles.detailText}><Text style={styles.bold}>Deadline:</Text> {new Date(drive.registrationEnd).toLocaleDateString()}</Text>
                </View>

                <View style={styles.driveFooter}>
                  <Button size="sm">View Details</Button>
                </View>
              </View>
            ))
          )}
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Bell color={theme.colors.primary} size={20} />
          <Text style={styles.cardTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{unreadCount} New</Text>
            </View>
          )}
        </View>

        <View style={styles.list}>
          {notifications.length === 0 ? (
            <Text style={styles.emptyText}>You have no notifications.</Text>
          ) : (
            notifications.map(notification => (
              <View 
                key={notification.id} 
                style={[
                  styles.notificationItem, 
                  notification.isRead ? styles.notificationRead : styles.notificationUnread
                ]}
              >
                <View style={styles.notificationHeader}>
                  <Text style={[styles.notificationTitle, notification.isRead ? styles.textSlate700 : styles.textBlue900]}>
                    {notification.title}
                  </Text>
                  {!notification.isRead && (
                    <TouchableOpacity>
                      <Check color="#3B82F6" size={16} />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                
                <View style={styles.notificationFooter}>
                  <Text style={styles.notificationDate}>
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing[4],
    gap: theme.spacing[6],
  },
  header: {
    marginBottom: theme.spacing[2],
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B', // slate-800
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B', // slate-500
    marginTop: 4,
  },
  sectionCard: {
    padding: theme.spacing[4],
    marginBottom: theme.spacing[6],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: theme.spacing[2],
  },
  notificationBadge: {
    backgroundColor: '#FEE2E2', // red-100
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    marginLeft: 8,
  },
  notificationBadgeText: {
    color: '#DC2626', // red-600
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    gap: theme.spacing[4],
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    paddingVertical: 32,
  },
  driveItem: {
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: '#E2E8F0', // slate-200
    borderRadius: theme.radius.xl,
    marginBottom: theme.spacing[4],
  },
  driveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  jobRole: {
    color: '#475569',
    fontWeight: '500',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#DCFCE7', // green-100
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  badgeText: {
    color: '#15803D', // green-700
    fontSize: 12,
    fontWeight: 'bold',
  },
  driveDetails: {
    marginTop: theme.spacing[4],
    flexDirection: 'row',
    gap: theme.spacing[4],
  },
  detailText: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 16,
  },
  bold: {
    fontWeight: '600',
    color: '#334155',
  },
  driveFooter: {
    marginTop: theme.spacing[6],
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  notificationItem: {
    padding: theme.spacing[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginBottom: theme.spacing[4],
  },
  notificationRead: {
    backgroundColor: '#F8FAFC', // slate-50
    borderColor: '#F1F5F9', // slate-100
  },
  notificationUnread: {
    backgroundColor: '#EFF6FF', // blue-50
    borderColor: '#DBEAFE', // blue-100
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  textSlate700: {
    color: '#334155',
  },
  textBlue900: {
    color: '#1E3A8A',
  },
  notificationMessage: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 8,
    lineHeight: 18,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
  },
  notificationDate: {
    fontSize: 10,
    color: '#94A3B8',
  }
});
