import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Search, Mail, Phone, Plus, Building, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/native-stack';

import { theme } from '../../theme/theme';
import { Card, ScreenHeader, ListSkeleton, SearchBar, Badge, EmptyState } from '../../components/ui';
import { useAdminCoordinators } from '../../hooks/queries';

export default function AdminCoordinatorsScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: coordinators, isLoading, refetch } = useAdminCoordinators();

  const getFilteredCoordinators = () => {
    if (!coordinators) return [];
    if (!searchQuery) return coordinators;
    
    const lowerQuery = searchQuery.toLowerCase();
    return coordinators.filter((coordinator: any) => 
      coordinator.name.toLowerCase().includes(lowerQuery) ||
      coordinator.email.toLowerCase().includes(lowerQuery) ||
      (coordinator.profile?.department && coordinator.profile.department.toLowerCase().includes(lowerQuery))
    );
  };

  const renderCoordinatorCard = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.role}>{item.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Coordinator'}</Text>
          </View>
        </View>
        <Badge variant={item.role === 'SUPER_ADMIN' ? 'destructive' : 'info'}>
          {item.role === 'SUPER_ADMIN' ? 'Admin' : 'Coord'}
        </Badge>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Mail size={14} color={theme.colors.mutedForeground} />
          <Text style={styles.detailText}>{item.email}</Text>
        </View>
        {item.profile?.phone && (
          <View style={styles.detailRow}>
            <Phone size={14} color={theme.colors.mutedForeground} />
            <Text style={styles.detailText}>{item.profile.phone}</Text>
          </View>
        )}
        {item.profile?.department && (
          <View style={styles.detailRow}>
            <Building size={14} color={theme.colors.mutedForeground} />
            <Text style={styles.detailText}>{item.profile.department}</Text>
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader 
        title="Coordinators" 
        rightElement={
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Plus color={theme.colors.primary} size={24} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.toggleDrawer()}
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
          placeholder="Search coordinators..."
        />
      </View>

      {isLoading ? (
        <ListSkeleton />
      ) : (
        <FlatList
          data={getFilteredCoordinators()}
          keyExtractor={(item) => item.id}
          renderItem={renderCoordinatorCard}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
          ListEmptyComponent={
            <EmptyState
              icon={<User size={48} color={theme.colors.mutedForeground} />}
              title="No Coordinators Found"
              description="No placement coordinators match your search."
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
    marginBottom: theme.spacing[4],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.foreground,
  },
  role: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
  },
  detailsContainer: {
    gap: theme.spacing[2],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
  },
});
