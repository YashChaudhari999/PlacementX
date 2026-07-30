import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Menu, Building2, GraduationCap, Briefcase, TrendingUp,
  FileCheck, CheckCircle2, Clock, Calendar as CalendarIcon,
  Users, Trophy, Activity, IndianRupee, Building, ChevronRight
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';

import { theme } from '../../theme/theme';
import { Card, ScreenHeader, DashboardSkeleton } from '../../components/ui';
import { useAdminDashboard } from '../../hooks/queries';

const { width } = Dimensions.get('window');

// Helper component for Stat Cards
const AdminStatCard = ({ label, value, icon, iconColor, iconBg, description }: any) => (
  <TouchableOpacity style={styles.statCardContainer} activeOpacity={0.9}>
    <Card style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={styles.statTextGroup}>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={styles.statValue}>{value}</Text>
        </View>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          {icon}
        </View>
      </View>
      {description && (
        <View style={styles.statFooter}>
          <View style={[styles.trendBadge, { backgroundColor: iconBg + '90' }]}>
            <Text style={[styles.statDesc, { color: iconColor }]}>{description}</Text>
          </View>
        </View>
      )}
    </Card>
  </TouchableOpacity>
);

export default function AdminDashboardScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { data: dashboard, isLoading, refetch } = useAdminDashboard();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader 
          title="Overview" 
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

  const formatNum = (num: number) => num?.toLocaleString('en-IN') || '0';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader 
        title="Overview" 
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
        <View style={styles.headerArea}>
          <Text style={styles.headerSubtitle}>Real-time metrics for placement drives, students, and offers.</Text>
          <View style={styles.lastUpdatedRow}>
            <Clock size={14} color={theme.colors.mutedForeground} />
            <Text style={styles.lastUpdatedText}>Last updated: Just now</Text>
          </View>
        </View>

        {/* SECTION 1: DRIVES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIconBg, { backgroundColor: '#e0e7ff' }]}>
                <CalendarIcon size={18} color="#4f46e5" />
              </View>
              <Text style={styles.sectionTitle}>Drives</Text>
            </View>
            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={14} color="#4f46e5" />
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
            <View style={styles.horizontalCardWrapper}>
              <AdminStatCard 
                label="Today's Drives" 
                value={formatNum(dashboard?.drives?.today)} 
                icon={<CalendarIcon size={24} color="#2563eb" />}
                iconBg="#dbeafe"
                description="Active Today"
              />
            </View>
            <View style={styles.horizontalCardWrapper}>
              <AdminStatCard 
                label="Upcoming" 
                value={formatNum(dashboard?.drives?.upcomingClosed)} 
                icon={<Clock size={24} color="#4f46e5" />}
                iconBg="#e0e7ff"
                description="Reg. Closed"
              />
            </View>
            <View style={styles.horizontalCardWrapper}>
              <AdminStatCard 
                label="Open Drives" 
                value={formatNum(dashboard?.drives?.open)} 
                icon={<Briefcase size={24} color="#16a34a" />}
                iconBg="#dcfce7"
                description="Accepting Apps"
              />
            </View>
          </ScrollView>
        </View>

        {/* SECTION 2: STUDENTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIconBg, { backgroundColor: '#fef3c7' }]}>
                <Users size={18} color="#d97706" />
              </View>
              <Text style={styles.sectionTitle}>Students</Text>
            </View>
            <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('Students')}>
              <Text style={styles.viewAllText}>Manage</Text>
              <ChevronRight size={14} color="#4f46e5" />
            </TouchableOpacity>
          </View>

          <Card style={styles.listCard}>
            <View style={styles.listCardHeader}>
              <View>
                <Text style={styles.listCardTitle}>Eligible Students by Company</Text>
                <Text style={styles.listCardSubtitle}>For active & upcoming drives</Text>
              </View>
              <View style={styles.listCardIconBox}>
                <CheckCircle2 size={18} color={theme.colors.mutedForeground} />
              </View>
            </View>
            
            <View style={styles.listContent}>
              {dashboard?.students?.eligibleByCompany?.length > 0 ? (
                dashboard.students.eligibleByCompany.map((item: any, idx: number) => (
                  <TouchableOpacity key={idx} style={styles.listItem} activeOpacity={0.7}>
                    <View style={styles.listItemLeft}>
                      <View style={styles.listAvatar}>
                        <Text style={styles.listAvatarText}>{item.company.substring(0, 2).toUpperCase()}</Text>
                      </View>
                      <Text style={styles.listCompanyName}>{item.company}</Text>
                    </View>
                    <View style={styles.listItemRight}>
                      <Text style={styles.listCount}>{formatNum(item.count)}</Text>
                      <ChevronRight size={16} color={theme.colors.border} />
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyStateIcon}>
                    <CheckCircle2 size={32} color={theme.colors.mutedForeground} />
                  </View>
                  <Text style={styles.emptyStateTitle}>No active drives</Text>
                  <Text style={styles.emptyStateText}>When drives are open or upcoming, counts will appear here.</Text>
                </View>
              )}
            </View>
          </Card>

          <Card style={[styles.listCard, { marginTop: theme.spacing[4] }]}>
            <View style={styles.listCardHeader}>
              <View>
                <Text style={styles.listCardTitle}>Applications by Company</Text>
                <Text style={styles.listCardSubtitle}>Top recruiters by volume</Text>
              </View>
              <View style={styles.listCardIconBox}>
                <Building2 size={18} color={theme.colors.mutedForeground} />
              </View>
            </View>
            
            <View style={styles.listContent}>
              {dashboard?.students?.applicationsByCompany?.length > 0 ? (
                dashboard.students.applicationsByCompany.map((item: any, idx: number) => (
                  <TouchableOpacity key={idx} style={styles.listItem} activeOpacity={0.7}>
                    <View style={styles.listItemLeft}>
                      <View style={styles.listAvatar}>
                        <Text style={styles.listAvatarText}>{item.company.substring(0, 2).toUpperCase()}</Text>
                      </View>
                      <Text style={styles.listCompanyName}>{item.company}</Text>
                    </View>
                    <View style={styles.listItemRight}>
                      <Text style={styles.listCount}>{formatNum(item.applications)}</Text>
                      <ChevronRight size={16} color={theme.colors.border} />
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyStateIcon}>
                    <FileCheck size={32} color={theme.colors.mutedForeground} />
                  </View>
                  <Text style={styles.emptyStateTitle}>No applications yet</Text>
                  <Text style={styles.emptyStateText}>When students apply, top companies appear here.</Text>
                </View>
              )}
            </View>
          </Card>
        </View>

        {/* SECTION 3: PACKAGES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIconBg, { backgroundColor: '#ffe4e6' }]}>
                <Trophy size={18} color="#e11d48" />
              </View>
              <Text style={styles.sectionTitle}>Placement Packages</Text>
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
            <View style={styles.horizontalCardWrapper}>
              <AdminStatCard 
                label="Placement %" 
                value={`${dashboard?.packages?.placementPercentage || 0}%`} 
                icon={<GraduationCap size={24} color="#e11d48" />}
                iconBg="#ffe4e6"
                description="Target: 95%"
              />
            </View>
            <View style={styles.horizontalCardWrapper}>
              <AdminStatCard 
                label="Highest" 
                value={`${dashboard?.packages?.highest || 0} LPA`} 
                icon={<TrendingUp size={24} color="#9333ea" />}
                iconBg="#f3e8ff"
                description="Max Offer"
              />
            </View>
            <View style={styles.horizontalCardWrapper}>
              <AdminStatCard 
                label="Average" 
                value={`${dashboard?.packages?.average || 0} LPA`} 
                icon={<Activity size={24} color="#c026d3" />}
                iconBg="#fae8ff"
                description="All offers"
              />
            </View>
          </ScrollView>
        </View>

        {/* SECTION 4: OVERALL */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIconBg, { backgroundColor: '#cffafe' }]}>
                <Building size={18} color="#0891b2" />
              </View>
              <Text style={styles.sectionTitle}>Overall Statistics</Text>
            </View>
          </View>
          
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <AdminStatCard 
                label="Companies" 
                value={formatNum(dashboard?.overall?.companiesVisited)} 
                icon={<Building2 size={24} color="#0891b2" />}
                iconBg="#cffafe"
                description="Total visited"
              />
            </View>
            <View style={styles.gridCol}>
              <AdminStatCard 
                label="Total Offers" 
                value={formatNum(dashboard?.overall?.totalOffers)} 
                icon={<FileCheck size={24} color="#0d9488" />}
                iconBg="#ccfbf1"
                description="All selections"
              />
            </View>
          </View>
        </View>

        <View style={{ height: theme.spacing[8] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff', // Clean white background like web
  },
  scrollContent: {
    padding: theme.spacing[4],
  },
  menuBtn: {
    padding: theme.spacing[2],
  },
  headerArea: {
    marginBottom: theme.spacing[8],
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    fontWeight: '500',
  },
  lastUpdatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: theme.spacing[3],
    backgroundColor: '#f8fafc',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  lastUpdatedText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.mutedForeground,
  },
  section: {
    marginBottom: theme.spacing[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: theme.spacing[3],
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  sectionIconBg: {
    padding: 8,
    borderRadius: theme.radius.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.foreground,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 13,
    color: '#4f46e5',
    fontWeight: '600',
  },
  gridRow: {
    flexDirection: 'row',
    gap: theme.spacing[4],
  },
  gridCol: {
    flex: 1,
  },
  horizontalScrollContent: {
    paddingRight: theme.spacing[4],
  },
  horizontalCardWrapper: {
    width: width * 0.42,
    marginRight: theme.spacing[4],
  },
  
  // Custom Stat Card
  statCardContainer: {
    flex: 1,
  },
  statCard: {
    padding: theme.spacing[4],
    flex: 1,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statTextGroup: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
    color: theme.colors.foreground,
    letterSpacing: -0.5,
  },
  iconBox: {
    padding: 10,
    borderRadius: 14,
  },
  statFooter: {
    marginTop: theme.spacing[5],
    flexDirection: 'row',
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statDesc: {
    fontSize: 11,
    fontWeight: '700',
  },

  // List Cards
  listCard: {
    padding: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: '#ffffff',
  },
  listCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.foreground,
  },
  listCardSubtitle: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    fontWeight: '500',
    marginTop: 2,
  },
  listCardIconBox: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  listContent: {
    backgroundColor: '#f8fafc',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    backgroundColor: '#ffffff',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  listAvatar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  listAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.mutedForeground,
  },
  listCompanyName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.foreground,
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  listCount: {
    fontSize: 16,
    fontWeight: '900',
    color: theme.colors.foreground,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  emptyState: {
    padding: theme.spacing[8],
    alignItems: 'center',
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
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.foreground,
  },
  emptyStateText: {
    color: theme.colors.mutedForeground,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 200,
  },
});

