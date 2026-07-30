import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar as CalendarIcon, Clock, MapPin, Building, Briefcase } from 'lucide-react-native';

import { theme } from '../../theme/theme';
import { Card, ScreenHeader, ListSkeleton, StatusBadge, EmptyState } from '../../components/ui';
import { useStudentInterviews } from '../../hooks/queries';

export default function InterviewsScreen() {
  const { data: interviews, isLoading, refetch } = useStudentInterviews();

  const renderInterviewCard = ({ item }: { item: any }) => {
    return (
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.companyName}>{item.company || 'Unknown Company'}</Text>
          <StatusBadge status={item.status} />
        </View>
        
        <View style={styles.companyInfo}>
          <Briefcase size={16} color={theme.colors.mutedForeground} />
          <Text style={styles.roleText}>
            {item.role || 'Role not specified'}
          </Text>
        </View>

        <View style={styles.roundsContainer}>
          <Text style={styles.roundsTitle}>Selection Rounds</Text>
          {item.rounds && item.rounds.length > 0 ? (
            item.rounds.map((round: any, index: number) => (
              <View key={round.id || index} style={styles.roundItem}>
                <View style={styles.roundHeader}>
                  <Text style={styles.roundTitle}>Round {round.roundNumber || index + 1}: {round.title}</Text>
                  {round.roundType && <Text style={styles.roundType}>{round.roundType}</Text>}
                </View>
                
                <View style={styles.detailsGrid}>
                  {round.date && (
                    <View style={styles.detailRow}>
                      <CalendarIcon size={14} color={theme.colors.primary} />
                      <Text style={styles.detailText}>
                        {new Date(round.date).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {round.time && (
                    <View style={styles.detailRow}>
                      <Clock size={14} color={theme.colors.primary} />
                      <Text style={styles.detailText}>{round.time}</Text>
                    </View>
                  )}
                </View>

                {(round.venue || round.platform) && (
                  <View style={styles.locationRow}>
                    <MapPin size={14} color={theme.colors.mutedForeground} />
                    <Text style={styles.locationText}>{round.venue || round.platform}</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noRoundsText}>No rounds scheduled yet.</Text>
          )}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="My Rounds" showBack />
      
      {isLoading ? (
        <ListSkeleton />
      ) : (
        <FlatList
          data={interviews}
          keyExtractor={(item) => item.applicationId}
          renderItem={renderInterviewCard}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
          ListEmptyComponent={
            <EmptyState
              icon={<CalendarIcon size={48} color={theme.colors.mutedForeground} />}
              title="No Rounds Scheduled"
              description="You do not have any upcoming selection rounds or assessments."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: theme.spacing[4],
  },
  card: {
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[2],
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.foreground,
    flex: 1,
    marginRight: theme.spacing[2],
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
  },
  roleText: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    fontWeight: '500',
  },
  roundsContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing[3],
  },
  roundsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.foreground,
    marginBottom: theme.spacing[3],
  },
  roundItem: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.sm,
    padding: theme.spacing[3],
    marginBottom: theme.spacing[2],
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  roundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  roundTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.foreground,
    flex: 1,
  },
  roundType: {
    fontSize: 12,
    color: theme.colors.primary,
    backgroundColor: theme.colors.primary + '1A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[2],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.foreground,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  locationText: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
  },
  noRoundsText: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    fontStyle: 'italic',
  }
});
