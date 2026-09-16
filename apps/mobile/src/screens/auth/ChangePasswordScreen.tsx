import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react-native';

import { Input, Button, Card, Toast } from '../../components/ui';
import { theme } from '../../theme/theme';
import { useAuthStore } from '../../stores/authStore';
import apiClient from '../../lib/apiClient';
import { API_ENDPOINTS } from '../../config/api';

const { width, height } = Dimensions.get('window');

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, setAuth, token } = useAuthStore();
  const insets = useSafeAreaInsets();

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.post(API_ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });

      Toast.success('Password changed successfully');
      
      // Update local state to remove the mustChangePassword flag
      if (user && token) {
        setAuth({ ...user, mustChangePassword: false }, token, false);
      }
    } catch (error: any) {
      Toast.error(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Lock size={36} color={theme.colors.card} strokeWidth={2.5} />
              </View>
            </View>
            <Text style={styles.title}>Update Password</Text>
            <Text style={styles.subtitle}>
              For security reasons, you must change your default password before accessing your account.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.cardWrapper}>
            <Card style={styles.card}>
              <View style={styles.form}>
                <Input
                  label="Current Password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  icon={<Lock color={theme.colors.mutedForeground} size={20} />}
                />
                
                <Input
                  label="New Password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  icon={<Lock color={theme.colors.mutedForeground} size={20} />}
                />
                
                <Input
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  icon={<Lock color={theme.colors.mutedForeground} size={20} />}
                />

                {/* Password Requirements */}
                <View style={styles.requirementsContainer}>
                  <View style={styles.reqItem}>
                    {newPassword.length >= 8 ? (
                      <CheckCircle size={14} color={theme.colors.success} />
                    ) : (
                      <AlertCircle size={14} color={theme.colors.mutedForeground} />
                    )}
                    <Text style={[
                      styles.reqText, 
                      newPassword.length >= 8 && { color: theme.colors.success }
                    ]}>
                      At least 8 characters
                    </Text>
                  </View>
                  <View style={styles.reqItem}>
                    {newPassword.length > 0 && newPassword === confirmPassword ? (
                      <CheckCircle size={14} color={theme.colors.success} />
                    ) : (
                      <AlertCircle size={14} color={theme.colors.mutedForeground} />
                    )}
                    <Text style={[
                      styles.reqText, 
                      newPassword.length > 0 && newPassword === confirmPassword && { color: theme.colors.success }
                    ]}>
                      Passwords match
                    </Text>
                  </View>
                </View>

                <Button
                  title="Update Password"
                  onPress={handleChangePassword}
                  isLoading={isLoading}
                  style={styles.submitButton}
                />
              </View>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#e0e7ff', // light indigo
    opacity: 0.6,
  },
  bgCircleBottomLeft: {
    position: 'absolute',
    bottom: -height * 0.1,
    left: -width * 0.3,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: '#c7d2fe', // slightly darker indigo
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
    alignItems: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: theme.spacing[6],
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.foreground,
    marginBottom: 12,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing[4],
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
    borderRadius: 24,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  form: {
    gap: theme.spacing[5],
  },
  requirementsContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing[4],
    borderRadius: 12,
    gap: theme.spacing[2],
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reqText: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
    fontWeight: '500',
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
});
