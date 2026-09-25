import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Menu, ShieldCheck, Users, LogOut, Moon, Sun } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';

import { Button, ConfirmationDialog, Input, PageHeader, ScreenContainer, SurfaceCard, Toast } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { useAppTheme } from '../../theme/ThemeProvider';
import apiClient from '../../lib/apiClient';
import type { AdminDrawerParamList } from '../../navigation/types';

export default function AdminSettingsScreen() {
  const navigation = useNavigation<DrawerNavigationProp<AdminDrawerParamList>>();
  const { user, logout } = useAuthStore();
  const { theme, resolvedMode, setMode } = useAppTheme();
  const [confirmLogout, setConfirmLogout] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [passwords, setPasswords] = React.useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const updatePassword = async () => {
    if (!passwords.currentPassword || passwords.newPassword.length < 8 || passwords.newPassword !== passwords.confirmPassword) {
      Toast.error('Enter the current password and matching new passwords of at least 8 characters');
      return;
    }
    try {
      setLoading(true);
      await apiClient.put('/auth/password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Toast.success('Password updated');
    } catch (error: any) {
      Toast.error(error?.response?.data?.message || 'Unable to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <PageHeader title="Settings" subtitle={isSuperAdmin ? 'Administrator security and access' : 'Coordinator security'} right={<Pressable accessibilityRole="button" accessibilityLabel="Open menu" onPress={() => navigation.toggleDrawer()} style={styles.menu}><Menu size={22} color={theme.colors.foreground} /></Pressable>} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SurfaceCard style={styles.identity}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}><Text style={[styles.initials, { color: theme.colors.primaryForeground }]}>{(user?.name || user?.firstName || 'A').slice(0, 2).toUpperCase()}</Text></View>
          <View style={styles.grow}><Text style={[styles.name, { color: theme.colors.foreground }]}>{user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Administrator'}</Text><Text style={[styles.meta, { color: theme.colors.foregroundMuted }]}>{user?.email} · {user?.role?.replaceAll('_', ' ')}</Text></View>
        </SurfaceCard>

        <Text style={[styles.eyebrow, { color: theme.colors.foregroundMuted }]}>APPEARANCE</Text>
        <SurfaceCard style={styles.themeRow}>
          <Pressable accessibilityRole="radio" accessibilityState={{ checked: resolvedMode === 'light' }} onPress={() => setMode('light')} style={[styles.themeChoice, { borderColor: resolvedMode === 'light' ? theme.colors.primary : theme.colors.border }]}><Sun size={20} color={theme.colors.primary} /><Text style={{ color: theme.colors.foreground }}>Light</Text></Pressable>
          <Pressable accessibilityRole="radio" accessibilityState={{ checked: resolvedMode === 'dark' }} onPress={() => setMode('dark')} style={[styles.themeChoice, { borderColor: resolvedMode === 'dark' ? theme.colors.primary : theme.colors.border }]}><Moon size={20} color={theme.colors.primary} /><Text style={{ color: theme.colors.foreground }}>Dark</Text></Pressable>
        </SurfaceCard>

        {isSuperAdmin ? <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Coordinators')} style={[styles.accessRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Users size={21} color={theme.colors.primary} /><View style={styles.grow}><Text style={[styles.name, { color: theme.colors.foreground }]}>Coordinator access</Text><Text style={[styles.meta, { color: theme.colors.foregroundMuted }]}>Invite and manage coordinator accounts</Text></View></Pressable> : null}

        <Text style={[styles.eyebrow, { color: theme.colors.foregroundMuted }]}>SECURITY</Text>
        <SurfaceCard style={styles.form}>
          <View style={styles.formTitle}><ShieldCheck size={21} color={theme.colors.primary} /><Text style={[styles.name, { color: theme.colors.foreground }]}>Change password</Text></View>
          <Input label="Current password" value={passwords.currentPassword} onChangeText={value => setPasswords(current => ({ ...current, currentPassword: value }))} secureTextEntry />
          <Input label="New password" value={passwords.newPassword} onChangeText={value => setPasswords(current => ({ ...current, newPassword: value }))} secureTextEntry />
          <Input label="Confirm new password" value={passwords.confirmPassword} onChangeText={value => setPasswords(current => ({ ...current, confirmPassword: value }))} secureTextEntry />
          <Button title="Update password" onPress={updatePassword} isLoading={loading} />
        </SurfaceCard>

        <Pressable accessibilityRole="button" onPress={() => setConfirmLogout(true)} style={[styles.logout, { borderColor: theme.colors.destructive }]}><LogOut size={20} color={theme.colors.destructive} /><Text style={{ color: theme.colors.destructive, fontWeight: '700' }}>Log out</Text></Pressable>
      </ScrollView>
      <ConfirmationDialog visible={confirmLogout} title="Log out?" message="You will need to sign in again to continue." confirmLabel="Log out" destructive onCancel={() => setConfirmLogout(false)} onConfirm={logout} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  menu: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 17, fontWeight: '800' },
  grow: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginTop: 22, marginBottom: 8 },
  themeRow: { flexDirection: 'row', gap: 10 },
  themeChoice: { minHeight: 54, flex: 1, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  accessRow: { minHeight: 72, borderWidth: 1, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, marginTop: 18 },
  form: { gap: 14 },
  formTitle: { flexDirection: 'row', gap: 9, alignItems: 'center', marginBottom: 2 },
  logout: { minHeight: 52, borderWidth: 1, borderRadius: 14, marginTop: 26, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
});
