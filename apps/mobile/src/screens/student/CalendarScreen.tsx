import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react-native';

import type { AppTheme } from '../../theme/theme';
import { useAppTheme } from '../../theme/ThemeProvider';
import { ScreenHeader, Card, EmptyState, Badge, Button } from '../../components/ui';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../lib/apiClient';
import { API_ENDPOINTS } from '../../config/api';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  extendedProps?: {
    type: string;
    company?: string;
    description?: string;
  };
}

export default function CalendarScreen() {
  const { theme } = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch calendar events
  const { data: events, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['student-calendar'],
    queryFn: async () => {
      // In the API, the route is GET /student/calendar
      const response = await apiClient.get<{ events: CalendarEvent[] }>('/student/calendar');
      return response.data.events;
    },
  });

  // Filter events for selected month (simplified logic for list view)
  const monthEvents = events?.filter(event => {
    const eventDate = new Date(event.start);
    return eventDate.getMonth() === currentDate.getMonth() && eventDate.getFullYear() === currentDate.getFullYear();
  }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()) || [];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderEvent = ({ item }: { item: CalendarEvent }) => {
    const date = new Date(item.start);
    return (
      <Card style={styles.eventCard}>
        <View style={styles.eventDateBox}>
          <Text style={styles.eventMonth}>{date.toLocaleString('default', { month: 'short' })}</Text>
          <Text style={styles.eventDay}>{date.getDate()}</Text>
        </View>
        <View style={styles.eventDetails}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          {item.extendedProps?.company && (
            <Text style={styles.eventCompany}>{item.extendedProps.company}</Text>
          )}
          <View style={styles.eventMeta}>
            <Clock size={12} color={theme.colors.mutedForeground} />
            <Text style={styles.eventMetaText}>
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={styles.tagsContainer}>
            <Badge variant="info" style={{ backgroundColor: item.backgroundColor || theme.colors.primary }}>
              {item.extendedProps?.type || 'Event'}
            </Badge>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Placement Calendar" />
        
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.monthBtn}>
            <ChevronLeft size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.monthBtn}>
            <ChevronRight size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {isLoading && !isRefetching ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={{color: theme.colors.destructive, marginBottom: 12}}>Failed to load calendar events.</Text>
            <Button title="Retry" onPress={() => refetch()} variant="outline" />
          </View>
        ) : (
          <FlatList
            data={monthEvents}
            renderItem={renderEvent}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={
              <EmptyState 
                icon={<CalendarIcon size={48} color={theme.colors.mutedForeground} />}
                title="No Events"
                description={`There are no placement events scheduled for ${currentDate.toLocaleString('default', { month: 'long' })}.`}
              />
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safeArea: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing[4],
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  monthBtn: { padding: 8, backgroundColor: theme.colors.primary + '10', borderRadius: 12 },
  monthText: { fontSize: 18, fontWeight: '700', color: theme.colors.foreground },
  listContainer: { padding: theme.spacing[4] },
  eventCard: { flexDirection: 'row', padding: 0, marginBottom: theme.spacing[3], overflow: 'hidden' },
  eventDateBox: {
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing[4],
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  eventMonth: { fontSize: 13, fontWeight: '600', color: theme.colors.primary, textTransform: 'uppercase' },
  eventDay: { fontSize: 24, fontWeight: '800', color: theme.colors.primary },
  eventDetails: { padding: theme.spacing[4], flex: 1, justifyContent: 'center' },
  eventTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.foreground, marginBottom: 4 },
  eventCompany: { fontSize: 14, fontWeight: '500', color: theme.colors.mutedForeground, marginBottom: 8 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  eventMetaText: { fontSize: 13, color: theme.colors.mutedForeground },
  tagsContainer: { flexDirection: 'row', gap: 6 },
});
