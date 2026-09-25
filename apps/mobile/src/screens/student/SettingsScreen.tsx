import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { Bell, LogOut, Mail, Monitor, Moon, Sun, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenContainer, PageHeader, SurfaceCard, ConfirmationDialog } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { useAppTheme } from '../../theme/ThemeProvider';
import type { ProfileStackParamList } from '../../navigation/types';
import type { ThemeMode } from '../../theme/theme';

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { logout } = useAuthStore();
  const { theme, mode, setMode } = useAppTheme();
  const [confirmLogout, setConfirmLogout] = React.useState(false);

  const appearance: Array<{ value: ThemeMode; label: string; icon: React.ReactNode }> = [
    { value: 'system', label: 'System', icon: <Monitor size={19} color={theme.colors.foregroundMuted} /> },
    { value: 'light', label: 'Light', icon: <Sun size={19} color={theme.colors.foregroundMuted} /> },
    { value: 'dark', label: 'Dark', icon: <Moon size={19} color={theme.colors.foregroundMuted} /> },
  ];

  return (
    <ScreenContainer>
      <PageHeader title="Settings" subtitle="Notifications, appearance, and account" />
      <ScrollView contentContainerStyle={[styles.content, { padding: theme.spacing[4] }]}>
        <Text style={[styles.eyebrow, { color: theme.colors.foregroundMuted }]}>PREFERENCES</Text>
        <SurfaceCard style={styles.card}>
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('NotificationPreferences')} style={styles.row}>
            <View style={[styles.icon, { backgroundColor: theme.colors.primary + '14' }]}><Bell size={20} color={theme.colors.primary} /></View>
            <View style={styles.rowText}><Text style={[styles.title, { color: theme.colors.foreground }]}>Notification preferences</Text><Text style={[styles.subtitle, { color: theme.colors.foregroundMuted }]}>Choose the placement alerts you receive</Text></View>
            <ChevronRight size={20} color={theme.colors.foregroundMuted} />
          </Pressable>
        </SurfaceCard>

        <Text style={[styles.eyebrow, { color: theme.colors.foregroundMuted }]}>APPEARANCE</Text>
        <SurfaceCard style={[styles.card, styles.appearance]}>
          {appearance.map(option => (
            <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: mode === option.value }} onPress={() => setMode(option.value)} style={[styles.mode, { borderColor: mode === option.value ? theme.colors.primary : theme.colors.border, backgroundColor: mode === option.value ? theme.colors.primary + '14' : theme.colors.surface }]}>
              {option.icon}<Text style={[styles.modeText, { color: mode === option.value ? theme.colors.primary : theme.colors.foreground }]}>{option.label}</Text>
            </Pressable>
          ))}
        </SurfaceCard>

        <Text style={[styles.eyebrow, { color: theme.colors.foregroundMuted }]}>SUPPORT</Text>
        <SurfaceCard style={styles.card}>
          <Pressable accessibilityRole="link" onPress={() => Linking.openURL('mailto:placements@nmims.edu?subject=PlacementX%20Mobile%20Support')} style={styles.row}>
            <View style={[styles.icon, { backgroundColor: theme.colors.info + '14' }]}><Mail size={20} color={theme.colors.info} /></View>
            <View style={styles.rowText}><Text style={[styles.title, { color: theme.colors.foreground }]}>Contact placement cell</Text><Text style={[styles.subtitle, { color: theme.colors.foregroundMuted }]}>placements@nmims.edu</Text></View>
            <ChevronRight size={20} color={theme.colors.foregroundMuted} />
          </Pressable>
        </SurfaceCard>

        <Pressable accessibilityRole="button" onPress={() => setConfirmLogout(true)} style={[styles.logout, { borderColor: theme.colors.destructive }]}>
          <LogOut size={20} color={theme.colors.destructive} /><Text style={[styles.logoutText, { color: theme.colors.destructive }]}>Log out</Text>
        </Pressable>
        <Text style={[styles.version, { color: theme.colors.foregroundMuted }]}>PlacementX Mobile · Demo 1.0.0</Text>
      </ScrollView>
      <ConfirmationDialog visible={confirmLogout} title="Log out?" message="You will need to sign in again to access placement information." confirmLabel="Log out" destructive onCancel={() => setConfirmLogout(false)} onConfirm={logout} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginTop: 18, marginBottom: 8 },
  card: { padding: 0, overflow: 'hidden' },
  row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  appearance: { flexDirection: 'row', gap: 8, padding: 10 },
  mode: { flex: 1, minHeight: 70, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 6 },
  modeText: { fontSize: 13, fontWeight: '600' },
  logout: { minHeight: 52, borderWidth: 1, borderRadius: 14, marginTop: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  logoutText: { fontSize: 15, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: 12, marginTop: 18 },
});
