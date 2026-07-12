import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function RoleSelectScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Ionicons name="briefcase" size={40} color="#fff" />
          </View>
          <Text style={styles.appName}>PlacementX</Text>
          <Text style={styles.tagline}>Placement Cell Management Platform</Text>
        </View>

        <Text style={styles.heading}>Who are you?</Text>
        <Text style={styles.sub}>Select your role to continue</Text>

        <View style={styles.cards}>
          <TouchableOpacity
            style={styles.roleCard}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/auth/login', params: { role: 'STUDENT' } })}
          >
            <View style={[styles.roleIcon, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="school" size={32} color="#4F46E5" />
            </View>
            <Text style={styles.roleName}>Student</Text>
            <Text style={styles.roleDesc}>Browse drives, apply, track your placement journey</Text>
            <View style={styles.arrowRow}>
              <Text style={styles.arrow}>Continue →</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleCard, styles.adminCard]}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/auth/login', params: { role: 'ADMIN' } })}
          >
            <View style={[styles.roleIcon, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="shield-checkmark" size={32} color="#EA580C" />
            </View>
            <Text style={styles.roleName}>Placement Head / Coordinator</Text>
            <Text style={styles.roleDesc}>Manage drives, students, analytics & reports</Text>
            <View style={styles.arrowRow}>
              <Text style={[styles.arrow, { color: '#EA580C' }]}>Continue →</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    alignSelf: 'flex-start',
  },
  sub: {
    fontSize: 14,
    color: '#64748B',
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 24,
  },
  cards: {
    width: '100%',
    gap: 16,
  },
  roleCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  adminCard: {
    borderColor: '#FED7AA',
  },
  roleIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  roleName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  roleDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  arrowRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  arrow: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
});
