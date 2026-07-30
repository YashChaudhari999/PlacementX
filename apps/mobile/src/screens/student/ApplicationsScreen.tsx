import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Calendar, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { theme } from '../../theme/theme';
import { Card, StatusBadge, ListSkeleton, ScreenHeader, SearchBar, TabBar } from '../../components/ui';
import { usePublishedDrives, useStudentApplications } from '../../hooks/queries';

export default function ApplicationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [activeTab, setActiveTab] = useState('All Drives');
  const [searchQuery, setSearchQuery] = useState('');

  const { 
    data: allDrives, 
    isLoading: loadingDrives, 
    refetch: refetchDrives 
  } = usePublishedDrives();
  
  const { 
    data: applications, 
    isLoading: loadingApps, 
    refetch: refetchApps 
  } = useStudentApplications();

  const handleRefresh = () => {
    refetchDrives();
    refetchApps();
  };

  const handleDrivePress = (id: string) => {
    // Navigate to DriveDetails which is nested inside HomeStack
    navigation.navigate('HomeStack', { screen: 'DriveDetails', params: { id } });
  };

  const renderDriveCard = ({ item }: { item: any }) => {
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
  };

  const getFilteredData = () => {
    let data = activeTab === 'All Drives' ? (allDrives || []) : (applications || []);
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter((item: any) => {
        const drive = activeTab === 'All Drives' ? item : item.drive;
        return (
          drive.company?.name?.toLowerCase().includes(lowerQuery) ||
          drive.jobRole?.toLowerCase().includes(lowerQuery)
        );
      });
    }
    
    return data;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Placement Drives" />
      
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

      {(loadingDrives || loadingApps) ? (
        <ListSkeleton />
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
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {activeTab === 'All Drives' 
                  ? 'No drives found.' 
                  : 'You have not applied to any drives yet.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[2],
  },
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
    marginTop: theme.spacing[4],
  },
  emptyText: {
    color: theme.colors.mutedForeground,
    fontSize: 15,
  },
});
