import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, User, Calendar, MapPin, Search, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { theme } from '../../theme/theme';
import { Card, StatusBadge, DashboardSkeleton } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { usePublishedDrives, useStudentProfile } from '../../hooks/queries';

const { height } = Dimensions.get('window');

export default function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuthStore();
  const { data: drives, isLoading: isLoadingDrives, refetch: refetchDrives } = usePublishedDrives();
  const { data: profile, isLoading: isLoadingProfile, refetch: refetchProfile } = useStudentProfile(user?.id);
  const insets = useSafeAreaInsets();

  const isRefreshing = false; 
  
  const handleRefresh = React.useCallback(() => {
    refetchDrives();
    refetchProfile();
  }, [refetchDrives, refetchProfile]);

  const handleDrivePress = (id: string) => {
    navigation.navigate('DriveDetails', { id });
  };

  if (isLoadingDrives || isLoadingProfile) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <DashboardSkeleton />
        </SafeAreaView>
      </View>
    );
  }

  const renderDriveCard = (drive: any) => (
    <TouchableOpacity 
      key={drive.id} 
      activeOpacity={0.8}
      onPress={() => handleDrivePress(drive.id)}
      style={styles.cardWrapper}
    >
      <Card style={styles.driveCard}>
        <View style={styles.driveHeader}>
          <View style={styles.companyInfo}>
            <View style={styles.companyIconContainer}>
              <Text style={styles.companyIconText}>
                {drive.company?.name ? drive.company.name.charAt(0).toUpperCase() : 'C'}
              </Text>
            </View>
            <View>
              <Text style={styles.companyName}>{drive.company?.name || 'Unknown Company'}</Text>
              <Text style={styles.driveRole}>{drive.jobRole || 'Role not specified'}</Text>
            </View>
          </View>
          <StatusBadge status={drive.status} />
        </View>
        
        <View style={styles.driveDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <MapPin size={14} color={theme.colors.primary} />
            </View>
            <Text style={styles.detailText}>{drive.location || 'Location TBA'}</Text>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Calendar size={14} color={theme.colors.primary} />
            </View>
            <Text style={styles.detailText}>
              {drive.registrationEnd ? new Date(drive.registrationEnd).toLocaleDateString() : 'TBA'}
            </Text>
          </View>
        </View>

        <View style={styles.salaryContainer}>
          <View>
            <Text style={styles.salaryLabel}>CTC Package</Text>
            <Text style={styles.salaryAmount}>{drive.fixedSalary ? `₹${drive.fixedSalary.toLocaleString()}` : 'Not disclosed'}</Text>
          </View>
          <View style={styles.applyBtn}>
            <Text style={styles.applyBtnText}>Details</Text>
            <ChevronRight size={16} color={theme.colors.primary} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Top Background Decoration */}
        <View style={[styles.topBackground, { paddingTop: insets.top + theme.spacing[4] }]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greetingText}>Hello, {user?.name || 'Student'} 👋</Text>
              <Text style={styles.subtitleText}>Ready for your next opportunity?</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.headerIconButton}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Bell color="#FFFFFF" size={22} />
                {/* Notification dot */}
                <View style={styles.notificationDot} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerIconButton}
                onPress={() => navigation.navigate('ProfileStack')}
              >
                <User color="#FFFFFF" size={22} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.searchWrapper}>
          <TouchableOpacity 
            style={styles.searchFakeInput}
            onPress={() => navigation.navigate('Drives')}
            activeOpacity={0.9}
          >
            <Search color={theme.colors.mutedForeground} size={20} />
            <Text style={styles.searchPlaceholder}>Search companies, roles...</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Drives</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Drives')} style={styles.seeAllBtn}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {drives && drives.length > 0 ? (
            drives.slice(0, 4).map(renderDriveCard)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No upcoming drives at the moment.</Text>
            </View>
          )}
        </View>
        
        <View style={{ height: theme.spacing[8] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // slightly cooler off-white background
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
    elevation: 10,
  },
  scrollContent: {
    paddingBottom: theme.spacing[10],
  },
  topBackground: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing[5],
    paddingBottom: theme.spacing[10],
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing[4],
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.destructive,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  searchWrapper: {
    marginBottom: theme.spacing[6],
    marginTop: -28,
    marginHorizontal: theme.spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 10,
  },
  searchFakeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  searchPlaceholder: {
    color: theme.colors.mutedForeground,
    fontSize: 15,
  },
  section: {
    marginBottom: theme.spacing[6],
    paddingHorizontal: theme.spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.foreground,
  },
  seeAllBtn: {
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  cardWrapper: {
    marginBottom: theme.spacing[4],
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  driveCard: {
    padding: theme.spacing[5],
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
  },
  driveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[4],
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing[3],
  },
  companyIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  companyName: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.foreground,
    marginBottom: 2,
  },
  driveRole: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
  },
  driveDetails: {
    flexDirection: 'row',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[5],
    paddingBottom: theme.spacing[5],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    flex: 1,
  },
  detailIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.foreground,
  },
  salaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  salaryLabel: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    marginBottom: 4,
  },
  salaryAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  emptyState: {
    padding: theme.spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    color: theme.colors.mutedForeground,
    fontSize: 15,
  },
});
