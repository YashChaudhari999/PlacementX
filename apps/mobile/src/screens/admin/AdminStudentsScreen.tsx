import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Search, Mail, Phone, GraduationCap, Filter } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';

import { theme } from '../../theme/theme';
import { Card, ScreenHeader, ListSkeleton, SearchBar, Badge, EmptyState } from '../../components/ui';
import { useAdminStudents } from '../../hooks/queries';

export default function AdminStudentsScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: students, isLoading, refetch } = useAdminStudents();

  const getFilteredStudents = () => {
    if (!students) return [];
    if (!searchQuery) return students;
    
    const lowerQuery = searchQuery.toLowerCase();
    return students.filter((student: any) => 
      student.name.toLowerCase().includes(lowerQuery) ||
      student.email.toLowerCase().includes(lowerQuery) ||
      (student.profile?.rollNumber && student.profile.rollNumber.toLowerCase().includes(lowerQuery))
    );
  };

  const renderStudentCard = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.rollNumber}>{item.profile?.rollNumber || 'No Roll No'}</Text>
          </View>
        </View>
        <Badge variant={item.profile?.isVerified ? 'success' : 'warning'}>
          {item.profile?.isVerified ? 'Verified' : 'Pending'}
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
        <View style={styles.detailRow}>
          <GraduationCap size={14} color={theme.colors.mutedForeground} />
          <Text style={styles.detailText}>
            {item.profile?.department || 'N/A'} • CGPA: {item.profile?.academics?.cgpa || 'N/A'}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader 
        title="Manage Students" 
        rightElement={
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Filter color={theme.colors.foreground} size={24} />
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
          placeholder="Search by name, email, or roll number..."
        />
      </View>

      {isLoading ? (
        <ListSkeleton />
      ) : (
        <FlatList
          data={getFilteredStudents()}
          keyExtractor={(item) => item.id}
          renderItem={renderStudentCard}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
          ListEmptyComponent={
            <EmptyState
              icon={<Search size={48} color={theme.colors.mutedForeground} />}
              title="No Students Found"
              description="No students match your current search criteria."
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
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.foreground,
  },
  rollNumber: {
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
