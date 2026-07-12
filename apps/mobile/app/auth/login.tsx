import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: string }>();
  const { setUser } = useAuthStore();
  const isAdmin = role === 'ADMIN';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      const res = await api.post('/api/auth/login', { email, password });
      const { user, token } = res.data;

      // Validate role
      if (isAdmin && user.role === 'STUDENT') {
        Alert.alert('Access Denied', 'This account is not an admin/coordinator account.');
        return;
      }
      if (!isAdmin && user.role !== 'STUDENT') {
        Alert.alert('Access Denied', 'Please use the Admin login for this account.');
        return;
      }

      await setUser(user, token);
      if (user.role === 'STUDENT') {
        router.replace('/(student)/dashboard');
      } else {
        router.replace('/(admin)/dashboard');
      }
    } catch (err: any) {
      Alert.alert('Login Failed', err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Back button */}
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#64748B" />
          </TouchableOpacity>

          {/* Header */}
          <View style={[styles.iconBadge, isAdmin ? styles.iconAdmin : styles.iconStudent]}>
            <Ionicons
              name={isAdmin ? 'shield-checkmark' : 'school'}
              size={28}
              color={isAdmin ? '#EA580C' : '#4F46E5'}
            />
          </View>
          <Text style={styles.title}>{isAdmin ? 'Admin Login' : 'Student Login'}</Text>
          <Text style={styles.subtitle}>
            {isAdmin ? 'Placement Head & Coordinator Portal' : 'Sign in to your student portal'}
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              leftIcon={<Ionicons name="mail-outline" size={18} color="#94A3B8" />}
            />
            <Input
              label="Password"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />}
              containerStyle={{ marginTop: 16 }}
            />

            <TouchableOpacity
              style={styles.showPass}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={16} color="#64748B" />
              <Text style={styles.showPassText}>{showPassword ? 'Hide' : 'Show'} password</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={[styles.loginBtn, isAdmin ? styles.adminBtn : {}]}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  back: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 32,
  },
  iconBadge: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  iconStudent: { backgroundColor: '#EEF2FF' },
  iconAdmin: { backgroundColor: '#FFF7ED' },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 32, lineHeight: 20 },
  form: { gap: 0 },
  showPass: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-end', marginTop: 10, marginBottom: 24,
  },
  showPassText: { fontSize: 13, color: '#64748B' },
  loginBtn: { marginTop: 8 },
  adminBtn: { backgroundColor: '#EA580C' },
});
