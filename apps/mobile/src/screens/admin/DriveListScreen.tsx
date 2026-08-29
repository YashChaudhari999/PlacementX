import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Plus, MapPin, Calendar, Building, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { theme } from '../../theme/theme';
import { Card, ScreenHeader, StatusBadge, ListSkeleton, SearchBar, EmptyState } from '../../components/ui';
import { useAdminDrives } from '../../hooks/queries';

export default function DriveListScreen() {
  const drawerNav = useNavigation<DrawerNavigationProp<any>>();
  const stackNav = useNavigation<NativeStackNavigationProp<any>>();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: drives, isLoading, refetch } = useAdminDrives();

  const handleDrivePress = (id: string) => {
    stackNav.navigate('EventDetails', { id });
  };

  const getFilteredDrives = () => {
    if (!drives) return [];
    if (!searchQuery) return drives;
    
    const lowerQuery = searchQuery.toLowerCase();
    return drives.filter((drive: any) => 
      drive.company.name.toLowerCase().includes(lowerQuery) ||
      drive.role.toLowerCase().includes(lowerQuery)
    );
  };

  const renderDriveCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => handleDrivePress(item.id)}
    >
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{item.company.name}</Text>
            <Text style={styles.role}>{item.role}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
        
        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <MapPin size={14} color={theme.colors.mutedForeground} />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Calendar size={14} color={theme.colors.mutedForeground} />
            <Text style={styles.detailText}>
              Deadline: {new Date(item.registrationDeadline).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.statsText}>
            {item.applications?.length || 0} Applicants
          </Text>
          <ChevronRight size={16} color={theme.colors.mutedForeground} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader 
        title="Placement Drives" 
        rightElement={
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => stackNav.navigate('CreateDrive')}
              style={styles.actionBtn}
            >
              <Plus color={theme.colors.primary} size={24} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => drawerNav.toggleDrawer()}
              style={styles.actionBtn}
            >
              <Menu color={theme.colors.foreground} size={24} />
            </TouchableOpacity>
          </View>
        }
      />
      
      <View style={styles.searchContainer}>
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by company or role..."
        />
      </View>

      {isLoading ? (
        <ListSkeleton />
      ) : (
        <FlatList
          data={getFilteredDrives()}
          keyExtractor={(item) => item.id}
          renderItem={renderDriveCard}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
          ListEmptyComponent={
            <EmptyState
              icon={<Building size={48} color={theme.colors.mutedForeground} />}
              title="No Drives Found"
              description="You haven't created any placement drives yet, or none match your search."
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  actionBtn: {
    padding: theme.spacing[1],
  },
  searchContainer: {
    padding: theme.spacing[4],
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  listContent: {
    padding: theme.spacing[4],
  },
  card: {
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[3],
  },
  companyInfo: {
    flex: 1,
    marginRight: theme.spacing[2],
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.foreground,
  },
  role: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  statsText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.primary,
  },
});
