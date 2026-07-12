import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/role-select');
        },
      },
    ]);
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'SU';

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', color: '#4F46E5' },
    { icon: 'document-text-outline', label: 'My Resume', color: '#0891B2' },
    { icon: 'shield-checkmark-outline', label: 'Change Password', color: '#7C3AED' },
    { icon: 'help-circle-outline', label: 'Help & Support', color: '#64748B' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>My Profile</Text>

        {/* Avatar */}
        <Card style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.firstName ?? user?.email?.split('@')[0]}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="school" size={12} color="#4F46E5" />
            <Text style={styles.roleText}>Student</Text>
          </View>
        </Card>

        {/* Menu */}
        <Card style={styles.menuCard}>
          {menuItems.map((item, i) => (
            <View key={item.label}>
              <View style={styles.menuRow}>
                <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
              </View>
              {i < menuItems.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

        {/* Logout */}
        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="danger"
          style={{ marginTop: 16 }}
        />

        <Text style={styles.version}>PlacementX v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 20 },
  avatarCard: { alignItems: 'center', gap: 8, paddingVertical: 28, marginBottom: 16 },
  avatar: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  name: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  email: { fontSize: 13, color: '#64748B' },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 4,
  },
  roleText: { fontSize: 12, fontWeight: '600', color: '#4F46E5' },
  menuCard: { gap: 0, padding: 0, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1E293B' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 64 },
  version: { textAlign: 'center', color: '#CBD5E1', fontSize: 12, marginTop: 24 },
});
