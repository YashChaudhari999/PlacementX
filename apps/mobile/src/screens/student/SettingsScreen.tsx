import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Bell, Shield, CircleHelp, Moon, ChevronRight } from 'lucide-react-native';

import { theme } from '../../theme/theme';
import { Card, ScreenHeader, Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';

export default function SettingsScreen() {
  const { logout, user } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  const SettingRow = ({ icon, title, onPress, value }: { icon: React.ReactNode, title: string, onPress?: () => void, value?: React.ReactNode }) => (
    <TouchableOpacity 
      style={styles.settingRow} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <View style={styles.settingRight}>
        {value ? value : <ChevronRight size={20} color={theme.colors.mutedForeground} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Settings" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Card style={styles.card}>
            <SettingRow 
              icon={<Bell size={20} color={theme.colors.primary} />}
              title="Push Notifications"
              value={
                <Switch 
                  value={notificationsEnabled} 
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: theme.colors.muted, true: theme.colors.primary }}
                />
              }
            />
            <View style={styles.divider} />
            <SettingRow 
              icon={<Moon size={20} color={theme.colors.primary} />}
              title="Dark Mode"
              value={
                <Switch 
                  value={darkMode} 
                  onValueChange={setDarkMode}
                  trackColor={{ false: theme.colors.muted, true: theme.colors.primary }}
                />
              }
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card style={styles.card}>
            <SettingRow 
              icon={<Shield size={20} color={theme.colors.primary} />}
              title="Privacy & Security"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingRow 
              icon={<CircleHelp size={20} color={theme.colors.primary} />}
              title="Help & Support"
              onPress={() => {}}
            />
          </Card>
        </View>

        <View style={styles.logoutSection}>
          <Button 
            title="Log Out" 
            variant="outline"
            onPress={logout}
            icon={<LogOut size={20} color={theme.colors.destructive} />}
            style={styles.logoutButton}
            textStyle={styles.logoutText}
          />
          <Text style={styles.versionText}>PlacementX v1.0.0</Text>
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
  section: {
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing[2],
    marginLeft: theme.spacing[2],
    textTransform: 'uppercase',
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing[4],
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary + '1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.foreground,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 52 + theme.spacing[4], // align with text
  },
  logoutSection: {
    marginTop: theme.spacing[4],
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    borderColor: theme.colors.destructive,
    backgroundColor: theme.colors.destructive + '0A',
  },
  logoutText: {
    color: theme.colors.destructive,
  },
  versionText: {
    marginTop: theme.spacing[6],
    fontSize: 12,
    color: theme.colors.mutedForeground,
  },
});
