import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Shield, Globe, Server, Key, Bell, Moon, User, HelpCircle, FileText, Info, LogOut, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';

import { theme } from '../../theme/theme';
import { Card, ScreenHeader, Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import apiClient from '../../lib/apiClient';

const SettingItem = ({ 
  icon, 
  title, 
  subtitle, 
  rightElement, 
  onPress, 
  isLast 
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
}) => {
  const Component = onPress ? TouchableOpacity : View;
  
  return (
    <Component 
      style={[styles.settingItem, !isLast && styles.settingItemBorder]} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingIconContainer}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.settingRight}>
        {rightElement || (onPress ? <ChevronRight size={18} color={theme.colors.mutedForeground} /> : null)}
      </View>
    </Component>
  );
};

const SettingGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <View style={styles.groupContainer}>
    <Text style={styles.groupTitle}>{title}</Text>
    <View style={styles.groupCard}>
      {children}
    </View>
  </View>
);

export default function AdminSettingsScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { user, logout } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdatePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await apiClient.put('/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, {
        headers: { 'x-user-id': user?.id }
      });
      Alert.alert('Success', 'Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update password';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of the admin panel?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: () => logout()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader 
        title="Settings" 
        rightElement={
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuBtn}>
            <Menu color={theme.colors.foreground} size={24} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerArea}>
          <Text style={styles.headerTitle}>Platform Settings</Text>
          <Text style={styles.headerSubtitle}>Manage institutional preferences and administrator security.</Text>
        </View>

        {/* Custom Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'general' && styles.tabBtnActive]}
            onPress={() => setActiveTab('general')}
          >
            <Globe size={16} color={activeTab === 'general' ? theme.colors.primary : theme.colors.mutedForeground} />
            <Text style={[styles.tabText, activeTab === 'general' && styles.tabTextActive]}>General Rules</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'security' && styles.tabBtnActive]}
            onPress={() => setActiveTab('security')}
          >
            <Shield size={16} color={activeTab === 'security' ? theme.colors.primary : theme.colors.mutedForeground} />
            <Text style={[styles.tabText, activeTab === 'security' && styles.tabTextActive]}>Admin Security</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'general' ? (
          <Card style={styles.contentCard}>
            <View style={styles.cardHeader}>
              <Server size={20} color={theme.colors.mutedForeground} />
              <Text style={styles.cardTitle}>Platform Configuration</Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Institution Name</Text>
              <TextInput 
                style={styles.input} 
                defaultValue="NMIMS Placement Cell" 
                editable={false}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Support Email (Visible to students)</Text>
              <TextInput 
                style={styles.input} 
                defaultValue="placements@nmims.edu" 
                editable={false}
              />
            </View>

            <View style={styles.actionRow}>
              <Button 
                title="Save Configuration" 
                variant="outline"
                onPress={() => Alert.alert('Success', 'Settings saved!')}
              />
            </View>
          </Card>
        ) : (
          <Card style={styles.contentCard}>
            <View style={styles.cardHeader}>
              <Key size={20} color={theme.colors.mutedForeground} />
              <Text style={styles.cardTitle}>Change Admin Password</Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput 
                style={styles.input} 
                secureTextEntry
                value={passwords.currentPassword}
                onChangeText={(text) => setPasswords(p => ({ ...p, currentPassword: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput 
                style={styles.input} 
                secureTextEntry
                value={passwords.newPassword}
                onChangeText={(text) => setPasswords(p => ({ ...p, newPassword: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput 
                style={styles.input} 
                secureTextEntry
                value={passwords.confirmPassword}
                onChangeText={(text) => setPasswords(p => ({ ...p, confirmPassword: text }))}
              />
            </View>

            <View style={styles.actionRow}>
              <Button 
                title={loading ? 'Updating...' : 'Update Password'} 
                onPress={handleUpdatePassword}
                disabled={loading}
              />
            </View>
          </Card>
        )}

        {/* Profile Card Summary */}
        <View style={styles.profileSummaryCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{user?.name?.substring(0, 2).toUpperCase() || 'AD'}</Text>
          </View>
          <View style={styles.profileSummaryInfo}>
            <Text style={styles.profileSummaryName}>{user?.name || 'Administrator'}</Text>
            <Text style={styles.profileSummaryEmail}>{user?.email || 'admin@placementx.com'}</Text>
          </View>
        </View>

        <SettingGroup title="Preferences">
          <SettingItem 
            icon={<Bell size={20} color="#4f46e5" />}
            title="Push Notifications"
            subtitle="Alerts for new placements"
            rightElement={
              <Switch 
                value={notifications} 
                onValueChange={setNotifications} 
                trackColor={{ false: '#e2e8f0', true: '#4f46e5' }}
                thumbColor="#fff"
              />
            }
          />
          <SettingItem 
            icon={<Moon size={20} color="#0891b2" />}
            title="Dark Mode"
            subtitle="Toggle app appearance"
            rightElement={
              <Switch 
                value={darkMode} 
                onValueChange={setDarkMode} 
                trackColor={{ false: '#e2e8f0', true: '#0891b2' }}
                thumbColor="#fff"
              />
            }
            isLast
          />
        </SettingGroup>

        <SettingGroup title="Security & Access">
          <SettingItem 
            icon={<Shield size={20} color="#10b981" />}
            title="Change Password"
            onPress={() => {}}
          />
          <SettingItem 
            icon={<User size={20} color="#8b5cf6" />}
            title="Admin Roles"
            subtitle="Manage coordinator access"
            onPress={() => navigation.navigate('AdminCoordinators')}
            isLast
          />
        </SettingGroup>
        
        <SettingGroup title="Support & About">
          <SettingItem 
            icon={<HelpCircle size={20} color="#f59e0b" />}
            title="Help Center"
            onPress={() => {}}
          />
          <SettingItem 
            icon={<FileText size={20} color="#64748b" />}
            title="Terms of Service"
            onPress={() => {}}
          />
          <SettingItem 
            icon={<Info size={20} color="#64748b" />}
            title="App Version"
            rightElement={<Text style={styles.versionText}>v1.0.0</Text>}
            isLast
          />
        </SettingGroup>

        <View style={styles.logoutContainer}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={18} color="#e11d48" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: theme.spacing[8] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: theme.spacing[4],
  },
  menuBtn: {
    padding: theme.spacing[2],
  },
  headerArea: {
    marginBottom: theme.spacing[4],
    paddingHorizontal: theme.spacing[2],
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    padding: 4,
    borderRadius: 12,
    marginBottom: theme.spacing[6],
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.mutedForeground,
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: theme.spacing[5],
    marginBottom: theme.spacing[6],
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing[4],
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  profileSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: theme.spacing[4],
    borderRadius: 16,
    marginBottom: theme.spacing[6],
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3],
  },
  profileAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4f46e5',
  },
  profileSummaryInfo: {
    flex: 1,
  },
  profileSummaryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  profileSummaryEmail: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
    fontWeight: '500',
  },
  groupContainer: {
    marginBottom: theme.spacing[6],
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing[3],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
    backgroundColor: '#ffffff',
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3],
  },
  settingContent: {
    flex: 1,
    justifyContent: 'center',
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  settingSubtitle: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  settingRight: {
    marginLeft: theme.spacing[3],
    justifyContent: 'center',
  },
  formGroup: {
    marginBottom: theme.spacing[4],
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: theme.spacing[2],
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: theme.spacing[3],
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  actionRow: {
    marginTop: theme.spacing[2],
  },
  logoutContainer: {
    marginTop: theme.spacing[2],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff1f2',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffe4e6',
    gap: 8,
  },
  logoutText: {
    color: '#e11d48',
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
    fontWeight: '500',
  },
});
