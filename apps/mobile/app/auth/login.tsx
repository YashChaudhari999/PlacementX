import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();

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
      // Hardcode role to STUDENT for the mobile app
      const res = await api.post('/api/auth/login', { email, password, role: 'STUDENT' });
      const { user, token } = res.data;

      if (user.role !== 'STUDENT') {
        Alert.alert('Access Denied', 'Only student accounts can log in to the mobile app.');
        return;
      }

      await setUser(user, token);
      router.replace('/(student)/dashboard');
    } catch (err: any) {
      Alert.alert('Login Failed', err?.response?.data?.message || err?.response?.data?.error || 'Invalid credentials');
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
          
          <View style={styles.headerSpacer} />

          {/* Header */}
          <View style={[styles.iconBadge, styles.iconStudent]}>
            <Ionicons
              name="school"
              size={28}
              color="#4F46E5"
            />
          </View>
          <Text style={styles.title}>Student Login</Text>
          <Text style={styles.subtitle}>
            Sign in to your PlacementX student portal
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="you@nmims.edu"
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
              style={styles.loginBtn}
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
  headerSpacer: { height: 60 },
  iconBadge: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  iconStudent: { backgroundColor: '#EEF2FF' },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 32, lineHeight: 20 },
  form: { gap: 0 },
  showPass: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-end', marginTop: 10, marginBottom: 24,
  },
  showPassText: { fontSize: 13, color: '#64748B' },
  loginBtn: { marginTop: 8 },
});
