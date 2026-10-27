import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, CheckCircle, KeyRound, Mail } from 'lucide-react-native';
import { Button, Card, Input, KeyboardAwareScrollView } from '../../components/ui';
import { authService } from '../../lib/authService';
import { useAppTheme } from '../../theme/ThemeProvider';
import type { AuthStackParamList } from '../../navigation/types';

type Step = 'email' | 'otp' | 'password' | 'success';
const errorMessage = (error: any) => error?.response?.data?.error?.message || error?.message || 'Unable to process the request';

export default function PasswordResetScreen() {
  const { theme } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetGrant, setResetGrant] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const requestCode = async (resend = false) => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid registered email address');
    setBusy(true); setError('');
    try {
      if (resend) await authService.resendPasswordReset(email);
      else await authService.requestPasswordReset(email);
      setOtp(''); setCooldown(60); setStep('otp');
    } catch (value) { setError(errorMessage(value)); }
    finally { setBusy(false); }
  };

  const verifyCode = async () => {
    if (!/^\d{6}$/.test(otp)) return setError('Enter the six-digit verification code');
    setBusy(true); setError('');
    try {
      const result = await authService.verifyPasswordResetOtp(email, otp);
      setResetGrant(result.resetGrant); setOtp(''); setStep('password');
    } catch (value) { setError(errorMessage(value)); }
    finally { setBusy(false); }
  };

  const updatePassword = async () => {
    if (newPassword.length < 12) return setError('Password must be at least 12 characters');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    setBusy(true); setError('');
    try {
      await authService.confirmPasswordReset(resetGrant, newPassword);
      setResetGrant(''); setNewPassword(''); setConfirmPassword(''); setStep('success');
    } catch (value) { setError(errorMessage(value)); }
    finally { setBusy(false); }
  };

  return <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
    <KeyboardAwareScrollView contentContainerStyle={styles.content}>
      <Button title="Back to Login" variant="ghost" onPress={() => navigation.navigate('Login')} icon={<ArrowLeft size={18} color={theme.colors.primary} />} style={styles.back} />
      <Card style={styles.card}>
        <View style={[styles.icon, { backgroundColor: theme.colors.primary + '14' }]}>
          {step === 'success' ? <CheckCircle size={30} color={theme.colors.success} /> : <KeyRound size={30} color={theme.colors.primary} />}
        </View>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.foreground }]}>
          {step === 'email' ? 'Reset your password' : step === 'otp' ? 'Enter verification code' : step === 'password' ? 'Create a new password' : 'Password updated'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>
          {step === 'email' && 'We will email a six-digit code that expires in five minutes.'}
          {step === 'otp' && `If an account exists for ${email}, a code has been sent.`}
          {step === 'password' && 'Use at least 12 characters. Long passphrases are supported.'}
          {step === 'success' && 'Sign in again with your new password.'}
        </Text>
        {!!error && <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.destructive }]}>{error}</Text>}

        {step === 'email' && <>
          <Input label="Registered Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" icon={<Mail size={19} color={theme.colors.mutedForeground} />} />
          <Button title="Send Verification Code" onPress={() => requestCode()} isLoading={busy} disabled={busy} />
        </>}
        {step === 'otp' && <>
          <Input label="Six-Digit Code" value={otp} onChangeText={value => setOtp(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" autoComplete="one-time-code" maxLength={6} style={styles.otp} />
          <Button title="Verify Code" onPress={verifyCode} isLoading={busy} disabled={busy || otp.length !== 6} />
          <Button title={cooldown ? `Resend Code in ${cooldown}s` : 'Resend Code'} variant="outline" onPress={() => requestCode(true)} disabled={busy || cooldown > 0} style={styles.secondary} />
        </>}
        {step === 'password' && <>
          <Input label="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry autoComplete="new-password" />
          <Text style={[styles.feedback, { color: theme.colors.mutedForeground }]}>Strength: {newPassword.length >= 16 ? 'Strong' : newPassword.length >= 12 ? 'Good' : 'Too short'}</Text>
          <Input label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoComplete="new-password" error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : undefined} />
          <Button title="Update Password" onPress={updatePassword} isLoading={busy} disabled={busy || newPassword.length < 12 || newPassword !== confirmPassword} />
        </>}
        {step === 'success' && <Button title="Return to Login" onPress={() => navigation.navigate('Login')} />}
      </Card>
    </KeyboardAwareScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  back: { alignSelf: 'flex-start', marginBottom: 10 },
  card: { padding: 22 },
  icon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  title: { fontSize: 27, lineHeight: 34, fontWeight: '800' },
  subtitle: { fontSize: 14, lineHeight: 21, marginTop: 7, marginBottom: 22 },
  error: { fontSize: 13, marginBottom: 15 },
  otp: { textAlign: 'center', fontSize: 24, letterSpacing: 10, fontWeight: '700' },
  feedback: { fontSize: 12, marginTop: -10, marginBottom: 12 },
  secondary: { marginTop: 12 },
});
