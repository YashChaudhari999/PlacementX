import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, KeyboardAvoidingView, Linking, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Calendar, ChevronRight, Lock } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { AppTheme } from '../../theme/theme';
import { useAppTheme } from '../../theme/ThemeProvider';
import { Card, StatusBadge, ListSkeleton, ScreenHeader, SearchBar, TabBar, EmptyState, ErrorState, FilterChip, Toast } from '../../components/ui';
import { PLACEMENTX_PROFILE_URL } from '../../config/api';
import { usePublishedDrives, useStudentApplications } from '../../hooks/queries';
import { useAuthStore } from '../../stores/authStore';



export default function ApplicationsScreen() {
  const { theme } = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { user } = useAuthStore();
  const profileStatus = user?.profileStatus || (user?.isProfileComplete ? 'PENDING_VERIFICATION' : 'NOT_COMPLETED');
  const profileVerified = profileStatus === 'VERIFIED';

  const openProfileWebsite = async () => {
    try {
      await Linking.openURL(PLACEMENTX_PROFILE_URL);
    } catch {
      Toast.error('Unable to open the PlacementX website');
    }
  };

  const [activeTab, setActiveTab] = useState(route.name === 'Applications' ? 'My Applications' : 'All Drives');
  const [searchQuery, setSearchQuery] = useState('');
  const [workMode, setWorkMode] = useState<'ALL' | 'REMOTE' | 'ONSITE'>('ALL');
  const [sortBy, setSortBy] = useState<'DEADLINE' | 'PACKAGE'>('DEADLINE');

  const { 
    data: allDrives, 
    isLoading: loadingDrives,
    isError: drivesError,
    refetch: refetchDrives 
  } = usePublishedDrives();
  
  const { 
    data: applications, 
    isLoading: loadingApps,
    isError: applicationsError,
    refetch: refetchApps 
  } = useStudentApplications();

  const handleRefresh = () => {
    refetchDrives();
    refetchApps();
  };

  const handleDrivePress = React.useCallback((id: string) => {
    // Navigate to DriveDetails which is nested inside HomeStack
    navigation.navigate('HomeStack', { screen: 'DriveDetails', params: { id } });
  }, [navigation]);

  const renderDriveCard = React.useCallback(({ item }: { item: any }) => {
    const drive = activeTab === 'My Applications' ? item.drive : item;
    const status = activeTab === 'My Applications' ? item.status : drive.status;

    return (
      <TouchableOpacity 
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
            <StatusBadge status={status} />
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
                {drive.registrationEnd ? new Date(drive.registrationEnd).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'TBA'}
              </Text>
            </View>
          </View>

          <View style={styles.salaryContainer}>
            <View>
              <Text style={styles.salaryLabel}>CTC Package</Text>
              <Text style={styles.salaryAmount}>{drive.fixedSalary ? `${drive.fixedSalary.toLocaleString()} LPA` : 'Not disclosed'}</Text>
            </View>
            <View style={styles.applyBtn}>
              <Text style={styles.applyBtnText}>Details</Text>
              <ChevronRight size={16} color={theme.colors.primary} />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }, [activeTab, handleDrivePress]);

  const getFilteredData = () => {
    let data: any[] = activeTab === 'All Drives' ? (allDrives || []) : (applications || []);
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter((item: any) => {
        const drive = activeTab === 'All Drives' ? item : item.drive;
        return (
          drive.company?.name?.toLowerCase().includes(lowerQuery) ||
          drive.jobRole?.toLowerCase().includes(lowerQuery)
        );
      });
    }    if (workMode !== 'ALL') {
      data = data.filter((item: any) => {
        const drive = activeTab === 'All Drives' ? item : item.drive;
        return String(drive.workMode || '').toUpperCase().includes(workMode);
      });
    }

    return [...data].sort((a: any, b: any) => {
      const driveA = activeTab === 'All Drives' ? a : a.drive;
      const driveB = activeTab === 'All Drives' ? b : b.drive;
      if (sortBy === 'PACKAGE') return Number(driveB.fixedSalary || 0) - Number(driveA.fixedSalary || 0);
      return new Date(driveA.registrationEnd || 8640000000000000).getTime() - new Date(driveB.registrationEnd || 8640000000000000).getTime();
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenHeader title="Drives & Applications" />
        
        <View style={styles.searchContainer}>
          <SearchBar 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search company or role..."
          />
        </View>

        <View style={styles.tabContainer}>
          <TabBar 
            tabs={['All Drives', 'My Applications']}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </View>
        <ScrollView horizontal style={styles.filterScroll} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <FilterChip label="All modes" selected={workMode === 'ALL'} onPress={() => setWorkMode('ALL')} />
          <FilterChip label="Remote" selected={workMode === 'REMOTE'} onPress={() => setWorkMode('REMOTE')} />
          <FilterChip label="On-site" selected={workMode === 'ONSITE'} onPress={() => setWorkMode('ONSITE')} />
          <FilterChip label={sortBy === 'DEADLINE' ? 'Sort: deadline' : 'Sort: package'} selected onPress={() => setSortBy(current => current === 'DEADLINE' ? 'PACKAGE' : 'DEADLINE')} accessibilityHint="Toggles drive sorting" />
        </ScrollView>

        {(loadingDrives || loadingApps) ? (
          <ListSkeleton />
        ) : (drivesError || applicationsError) ? (
          <ErrorState message="Placement drives could not be loaded." onRetry={handleRefresh} />
        ) : (!profileVerified && activeTab === 'All Drives') ? (
          <ScrollView contentContainerStyle={styles.lockedContainer} showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.lockedState}
              onPress={openProfileWebsite}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Open the PlacementX website to complete and submit your profile for verification."
            >
              <View style={styles.lockedIconWrap}>
                <Lock size={32} color={theme.colors.warning} />
              </View>
              <Text style={styles.lockedTitle}>Profile Verification Required</Text>
              <Text style={styles.lockedBody}>
                {profileStatus === 'NOT_COMPLETED'
                  ? 'Go to the PlacementX website, fill in your profile information, and submit it to the placement cell for verification. Drives will appear after approval.'
                  : 'Your profile is under review by the placement cell. Open the PlacementX website to check your profile and complete any requested changes.'}
              </Text>
              <View style={styles.lockedCta}>
                <Text style={styles.lockedCtaText}>
                  Open PlacementX Website
                </Text>
                <ChevronRight size={16} color={theme.colors.primary} />
              </View>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <FlatList
            data={getFilteredData()}
            keyExtractor={(item) => item.id}
            renderItem={renderDriveCard}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
            }
            ListEmptyComponent={
              <EmptyState
                icon={<MapPin size={48} color={theme.colors.mutedForeground} />}
                title={activeTab === 'All Drives' ? 'No Placement Drives' : 'No Applications'}
                description={activeTab === 'All Drives' 
                  ? 'There are currently no placement drives available.' 
                  : 'You have not applied to any drives yet.'}
              />
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[2],
  },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filterRow: { alignItems: 'center', paddingHorizontal: theme.spacing[4], paddingBottom: theme.spacing[3], gap: theme.spacing[2] },
  tabContainer: {
    paddingHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[2],
  },
  listContent: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[10],
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
    backgroundColor: theme.colors.card,
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
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    marginTop: theme.spacing[4],
  },
  emptyText: {
    color: theme.colors.mutedForeground,
    fontSize: 15,
  },
  lockedContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing[4],
  },
  lockedState: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: theme.colors.warning + '55',
    borderStyle: 'dashed',
    padding: theme.spacing[6],
    alignItems: 'center',
  },
  lockedIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.warning + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[4],
  },
  lockedTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.foreground,
    marginBottom: theme.spacing[2],
    textAlign: 'center',
  },
  lockedBody: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing[5],
  },
  lockedCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  lockedCtaText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
