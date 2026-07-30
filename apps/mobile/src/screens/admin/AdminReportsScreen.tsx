import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, FileSpreadsheet, Download, TrendingUp, Users, Building } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';

import { theme } from '../../theme/theme';
import { Card, ScreenHeader, DashboardSkeleton, Button, StatCard } from '../../components/ui';
import { useAdminReportsData } from '../../hooks/queries';

export default function AdminReportsScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { data: reportsData, isLoading, refetch } = useAdminReportsData();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Reports" />
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader 
        title="Reports & Analytics" 
        rightElement={
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuBtn}>
            <Menu color={theme.colors.foreground} size={24} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
      >
        <Card style={styles.exportCard}>
          <View style={styles.exportContent}>
            <View style={styles.exportIcon}>
              <FileSpreadsheet size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.exportTextContainer}>
              <Text style={styles.exportTitle}>Export Placement Data</Text>
              <Text style={styles.exportDesc}>Download comprehensive placement reports in CSV format.</Text>
            </View>
          </View>
          <Button 
            title="Download CSV" 
            icon={<Download size={18} color="#fff" />}
            onPress={() => {}} 
          />
        </Card>

        <Text style={styles.sectionTitle}>Key Metrics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard 
              title="Placement Rate" 
              value={reportsData?.placementRate ? `${reportsData.placementRate}%` : '0%'} 
              icon={<TrendingUp color={theme.colors.success} size={20} />} 
            />
            <View style={{ width: theme.spacing[4] }} />
            <StatCard 
              title="Total Offers" 
              value={reportsData?.totalOffers || 0} 
              icon={<Users color={theme.colors.primary} size={20} />} 
            />
          </View>
          <View style={[styles.statsRow, { marginTop: theme.spacing[4] }]}>
            <StatCard 
              title="Avg Package" 
              value={reportsData?.averagePackage ? `₹${(reportsData.averagePackage/100000).toFixed(1)}L` : '₹0'} 
              icon={<Building color={theme.colors.warning || '#F59E0B'} size={20} />} 
            />
            <View style={{ width: theme.spacing[4] }} />
            <StatCard 
              title="Highest Package" 
              value={reportsData?.highestPackage ? `₹${(reportsData.highestPackage/100000).toFixed(1)}L` : '₹0'} 
              icon={<TrendingUp color={theme.colors.info || '#3B82F6'} size={20} />} 
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Recruiting Companies</Text>
          <Card style={styles.listCard}>
            {reportsData?.topCompanies && reportsData.topCompanies.length > 0 ? (
              reportsData.topCompanies.map((company: any, index: number) => (
                <View 
                  key={index} 
                  style={[
                    styles.listItem, 
                    index !== reportsData.topCompanies.length - 1 && styles.listItemBorder
                  ]}
                >
                  <Text style={styles.companyName}>{company.name}</Text>
                  <Text style={styles.companyOffers}>{company.offers} offers</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No data available</Text>
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing[4],
  },
  menuBtn: {
    padding: theme.spacing[2],
  },
  exportCard: {
    padding: theme.spacing[4],
    marginBottom: theme.spacing[6],
    backgroundColor: theme.colors.primary + '0A',
    borderColor: theme.colors.primary + '33',
  },
  exportContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  exportIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary + '1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[3],
  },
  exportTextContainer: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.foreground,
    marginBottom: 2,
  },
  exportDesc: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
  },
  section: {
    marginTop: theme.spacing[6],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.foreground,
    marginBottom: theme.spacing[4],
  },
  statsGrid: {
    marginTop: theme.spacing[2],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listCard: {
    padding: theme.spacing[2],
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[2],
  },
  listItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.foreground,
  },
  companyOffers: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.mutedForeground,
    padding: theme.spacing[4],
  },
});
