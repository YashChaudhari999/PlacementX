import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, CalendarDays, Clock, CheckCircle2, Megaphone, Flag } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';

import { theme } from '../../theme/theme';
import { Card, ScreenHeader, DashboardSkeleton } from '../../components/ui';
import { useAdminCalendar } from '../../hooks/queries/useAdmin';

export default function AdminCalendarScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { data, isLoading, refetch } = useAdminCalendar();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader 
          title="Calendar" 
          rightElement={
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
              <Menu color={theme.colors.foreground} size={24} />
            </TouchableOpacity>
          }
        />
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  // Sort events chronologically
  const sortedEvents = data?.events 
    ? [...data.events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader 
        title="Placement Calendar" 
        rightElement={
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuBtn}>
            <Menu color={theme.colors.foreground} size={24} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Area */}
        <View style={styles.headerArea}>
          <Text style={styles.headerSubtitle}>Manage placement drives, academic schedules, and interviews.</Text>
        </View>

        {/* Summary Stats */}
        {data?.summary && (
          <View style={styles.summaryGrid}>
            <Card style={[styles.summaryCard, { borderLeftColor: '#4f46e5', backgroundColor: '#e0e7ff' }]}>
              <Text style={[styles.summaryVal, { color: '#4f46e5' }]}>{data.summary.upcomingDrives || 0}</Text>
              <Text style={[styles.summaryLabel, { color: '#4338ca' }]}>Upcoming Drives</Text>
            </Card>
            <Card style={[styles.summaryCard, { borderLeftColor: '#10b981', backgroundColor: '#dcfce7' }]}>
              <Text style={[styles.summaryVal, { color: '#10b981' }]}>{data.summary.registrationOpen || 0}</Text>
              <Text style={[styles.summaryLabel, { color: '#047857' }]}>Reg Open</Text>
            </Card>
            <Card style={[styles.summaryCard, { borderLeftColor: '#8b5cf6', backgroundColor: '#f3e8ff' }]}>
              <Text style={[styles.summaryVal, { color: '#8b5cf6' }]}>{data.summary.interviews || 0}</Text>
              <Text style={[styles.summaryLabel, { color: '#7e22ce' }]}>Interviews</Text>
            </Card>
          </View>
        )}

        {/* Timeline Events */}
        <View style={styles.timelineContainer}>
          <View style={styles.timelineTitleRow}>
            <View style={styles.timelineIconBg}>
              <CalendarDays size={18} color="#4f46e5" />
            </View>
            <Text style={styles.timelineHeader}>All Events</Text>
          </View>
          
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event: any, index: number) => {
              const eventDate = new Date(event.start);
              
              // Color mapping based on Web app hex codes
              let iconBg = '#f1f5f9';
              let iconColor = '#64748b';
              let Icon = CalendarDays;

              if (event.color === '#10b981') { // Registration
                iconBg = '#dcfce7'; iconColor = '#16a34a'; Icon = CheckCircle2;
              } else if (event.color === '#3b82f6') { // Drive
                iconBg = '#dbeafe'; iconColor = '#2563eb'; Icon = Flag;
              } else if (event.color === '#8b5cf6') { // Interview
                iconBg = '#fae8ff'; iconColor = '#c026d3'; Icon = Megaphone;
              } else if (event.color === '#ef4444') { // Deadline
                iconBg = '#fee2e2'; iconColor = '#dc2626'; Icon = Clock;
              }

              return (
                <View key={event.id} style={styles.eventItem}>
                  {/* Left Date Column */}
                  <View style={styles.eventDateCol}>
                    <Text style={styles.eventDateMonth}>{eventDate.toLocaleString('default', { month: 'short' }).toUpperCase()}</Text>
                    <Text style={styles.eventDateDay}>{eventDate.getDate()}</Text>
                  </View>
                  
                  {/* Divider Line */}
                  <View style={styles.timelineLine}>
                    <View style={[styles.timelineDot, { backgroundColor: iconColor }]} />
                    {index !== sortedEvents.length - 1 && (
                      <View style={styles.timelineLineSegment} />
                    )}
                  </View>
                  
                  {/* Event Content */}
                  <Card style={styles.eventCard}>
                    <View style={styles.eventHeader}>
                      <View style={[styles.eventIconBox, { backgroundColor: iconBg }]}>
                        <Icon size={16} color={iconColor} />
                      </View>
                      <Text style={[styles.eventStatus, { color: iconColor }]}>
                        {event.extendedProps?.status || 'Event'}
                      </Text>
                    </View>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    
                    {event.extendedProps?.company && (
                      <Text style={styles.eventCompany}>{event.extendedProps.company}</Text>
                    )}
                    
                    {!event.allDay && (
                      <View style={styles.eventTimeRow}>
                        <Clock size={12} color={theme.colors.mutedForeground} />
                        <Text style={styles.eventTime}>
                          {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    )}
                  </Card>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <CalendarDays size={32} color={theme.colors.mutedForeground} />
              </View>
              <Text style={styles.emptyStateText}>No upcoming events</Text>
            </View>
          )}
        </View>

        <View style={{ height: theme.spacing[8] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff', // Clean white
  },
  scrollContent: {
    padding: theme.spacing[4],
  },
  menuBtn: {
    padding: theme.spacing[2],
  },
  headerArea: {
    marginBottom: theme.spacing[6],
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    fontWeight: '500',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[8],
  },
  summaryCard: {
    flex: 1,
    padding: theme.spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 4,
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 0,
  },
  summaryVal: {
    fontSize: 22,
    fontWeight: '900',
  },
  summaryLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  timelineContainer: {
    marginTop: theme.spacing[2],
  },
  timelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: theme.spacing[3],
  },
  timelineIconBg: {
    padding: 8,
    borderRadius: theme.radius.md,
    backgroundColor: '#e0e7ff',
  },
  timelineHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.foreground,
  },
  eventItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing[4],
  },
  eventDateCol: {
    width: 48,
    alignItems: 'center',
    paddingTop: theme.spacing[2],
  },
  eventDateMonth: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.mutedForeground,
    letterSpacing: 0.5,
  },
  eventDateDay: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  timelineLine: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 26,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  timelineLineSegment: {
    width: 2,
    flex: 1,
    backgroundColor: '#e2e8f0',
    marginTop: 4,
    marginBottom: -16,
  },
  eventCard: {
    flex: 1,
    padding: theme.spacing[4],
    marginLeft: theme.spacing[2],
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  eventIconBox: {
    padding: 6,
    borderRadius: 8,
  },
  eventStatus: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.foreground,
    marginBottom: 4,
  },
  eventCompany: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.mutedForeground,
    marginBottom: 8,
  },
  eventTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventTime: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[4],
  },
  emptyStateText: {
    color: theme.colors.mutedForeground,
    fontSize: 14,
    fontWeight: '500',
  },
});
