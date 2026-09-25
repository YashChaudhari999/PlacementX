import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Lock, GraduationCap, ChevronRight } from 'lucide-react-native';

import { Input, Button, Card, Toast } from '../../components/ui';
import type { AppTheme } from '../../theme/theme';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../lib/authService';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { theme } = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const data = await authService.login({ email: email.trim(), password });
      // login method from authStore will save token and user state
      setAuth(data.user, data.token, data.user.mustChangePassword === true);
    } catch (error: any) {
      let message = error.message || 'Invalid credentials or server error';
      
      // Handle Firebase specific error codes
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            message = 'Invalid email or password';
            break;
          case 'auth/too-many-requests':
            message = 'Too many failed attempts. Please try again later.';
            break;
          default:
            message = error.message || 'Authentication failed';
        }
      }
      
      Toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Toast.error('Enter your email address first');
      return;
    }
    try {
      await authService.requestPasswordReset(email.trim());
      Toast.success('Password reset email sent');
    } catch (error: any) {
      Toast.error(error.message || 'Unable to send reset email');
    }
  };

  return (    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.card} />
      
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
                <GraduationCap size={36} color={theme.colors.card} strokeWidth={2.5} />
              </View>
              <Text style={styles.brandName}>PlacementX</Text>
            </View>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to your account to continue</Text>
          </View>

          {/* Login Card */}
          <View style={styles.cardWrapper}>
            <Card style={styles.card}>
              <View style={styles.form}>
                <Input
                  label="Email Address"
                  placeholder="name@nmims.edu"
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
                  <TouchableOpacity accessibilityRole="button" activeOpacity={0.7} onPress={handleForgotPassword}>
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
              Use of this app is governed by your institution's placement policies.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    color: theme.colors.foreground,
    letterSpacing: -0.5,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.foreground,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  cardWrapper: {
    shadowColor: theme.colors.foreground,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  card: {
    padding: theme.spacing[6],
    paddingTop: theme.spacing[5],
    borderRadius: 24,
    backgroundColor: theme.colors.card,
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
