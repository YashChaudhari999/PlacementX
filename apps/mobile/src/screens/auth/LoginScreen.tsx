import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Lock, GraduationCap, ChevronRight } from 'lucide-react-native';

import { Input, Button, Card, Toast, TabBar } from '../../components/ui';
import { theme } from '../../theme/theme';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../lib/authService';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('Student');
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.error('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      const roleToUse = activeTab === 'Student' ? 'STUDENT' : 'SUPER_ADMIN';
      const data = await authService.login({ email: email.trim(), password, role: roleToUse });
      // login method from authStore will save token and user state
      setAuth(data.user, data.token);
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Invalid credentials or server error';
      Toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Dynamic Background Elements */}
      <View style={styles.bgCircleTopRight} />
      <View style={styles.bgCircleBottomLeft} />

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60 }]} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <GraduationCap size={36} color="#ffffff" strokeWidth={2.5} />
              </View>
              <Text style={styles.brandName}>PlacementX</Text>
            </View>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to your account to continue</Text>
          </View>

          {/* Login Card */}
          <View style={styles.cardWrapper}>
            <Card style={styles.card}>
              <View style={styles.tabContainer}>
                <TabBar 
                  tabs={['Student', 'Admin']}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </View>
              
              <View style={styles.form}>
                <Input
                  label="Email Address"
                  placeholder={activeTab === 'Student' ? "name@student.edu" : "admin@placementx.com"}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  icon={<Mail color={theme.colors.mutedForeground} size={20} />}
                />
                
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  icon={<Lock color={theme.colors.mutedForeground} size={20} />}
                />
                
                <View style={styles.forgotPasswordContainer}>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>

                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  isLoading={isLoading}
                  style={styles.submitButton}
                />
              </View>
            </Card>
          </View>
          
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              By signing in, you agree to our{' '}
              <Text style={styles.footerLink}>Terms</Text> & <Text style={styles.footerLink}>Privacy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  bgCircleTopRight: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#ffe4e6', // light red/rose
    opacity: 0.6,
  },
  bgCircleBottomLeft: {
    position: 'absolute',
    bottom: -height * 0.1,
    left: -width * 0.3,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: '#fecdd3', // slightly darker rose
    opacity: 0.6,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[8],
  },
  headerContainer: {
    marginBottom: theme.spacing[8],
    alignItems: 'flex-start',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: theme.spacing[8],
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  cardWrapper: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  card: {
    padding: theme.spacing[6],
    paddingTop: theme.spacing[5],
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tabContainer: {
    marginBottom: theme.spacing[6],
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  form: {
    gap: theme.spacing[5],
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  submitButton: {
    marginTop: theme.spacing[2],
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  footerContainer: {
    marginTop: 'auto',
    paddingTop: theme.spacing[10],
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  footerLink: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
