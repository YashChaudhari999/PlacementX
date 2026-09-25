import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AlertTriangle, ArrowLeft, Check, RefreshCw, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

export const ScreenContainer = ({ children, scroll = false, keyboardAware = false, style, contentStyle }: { children: React.ReactNode; scroll?: boolean; keyboardAware?: boolean; style?: StyleProp<ViewStyle>; contentStyle?: StyleProp<ViewStyle> }) => {
  const { theme } = useAppTheme();
  const { contentMaxWidth } = useResponsiveLayout();
  const content = scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[{ flexGrow: 1, width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' }, contentStyle]}>{children}</ScrollView> : <View style={[{ flex: 1, width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' }, contentStyle]}>{children}</View>;
  return <SafeAreaView style={[{ flex: 1, backgroundColor: theme.colors.background }, style]}>{keyboardAware ? <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>{content}</KeyboardAvoidingView> : content}</SafeAreaView>;
};

export const SurfaceCard = ({ children, style, accessibilityLabel }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; accessibilityLabel?: string }) => {
  const { theme } = useAppTheme();
  return <View accessibilityLabel={accessibilityLabel} style={[{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.xl, padding: theme.spacing[4], ...theme.elevation.subtle }, style]}>{children}</View>;
};

export const IconButton = ({ label, hint, onPress, children, disabled = false }: { label: string; hint?: string; onPress: () => void; children: React.ReactNode; disabled?: boolean }) => {
  const { theme } = useAppTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityHint={hint} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => ({ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.full, backgroundColor: pressed ? theme.colors.surfaceSecondary : 'transparent', opacity: disabled ? 0.45 : 1 })}>{children}</Pressable>;
};

export const PageHeader = ({ title, subtitle, showBack = false, right }: { title: string; subtitle?: string; showBack?: boolean; right?: React.ReactNode }) => {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  return <View style={{ minHeight: 68, flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3], borderBottomWidth: 1, borderBottomColor: theme.colors.divider, backgroundColor: theme.colors.surface }}>{showBack ? <IconButton label="Go back" onPress={() => navigation.goBack()}><ArrowLeft size={22} color={theme.colors.foreground} /></IconButton> : null}<View style={{ flex: 1, marginLeft: showBack ? theme.spacing[1] : 0 }}><Text accessibilityRole="header" style={[theme.typography.h3, { color: theme.colors.foreground }]} numberOfLines={1}>{title}</Text>{subtitle ? <Text style={[theme.typography.bodySmall, { color: theme.colors.foregroundMuted, marginTop: 2 }]} numberOfLines={2}>{subtitle}</Text> : null}</View>{right}</View>;
};

export const LoadingState = ({ label = 'Loading' }: { label?: string }) => {
  const { theme } = useAppTheme();
  return <View accessibilityRole="progressbar" accessibilityLabel={label} style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={[theme.typography.body, { color: theme.colors.foregroundMuted, marginTop: 12 }]}>{label}</Text></View>;
};

export const ErrorState = ({ title = 'Unable to load', message, onRetry }: { title?: string; message: string; onRetry?: () => void }) => {
  const { theme } = useAppTheme();
  return <View accessibilityRole="alert" style={styles.center}><AlertTriangle size={36} color={theme.colors.destructive} /><Text style={[theme.typography.h3, { color: theme.colors.foreground, marginTop: 12, textAlign: 'center' }]}>{title}</Text><Text style={[theme.typography.body, { color: theme.colors.foregroundMuted, marginTop: 6, textAlign: 'center', maxWidth: 420 }]}>{message}</Text>{onRetry ? <Pressable accessibilityRole="button" accessibilityLabel="Try again" onPress={onRetry} style={({ pressed }) => ({ marginTop: 18, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, borderRadius: theme.radius.md, backgroundColor: theme.colors.primary, opacity: pressed ? 0.82 : 1 })}><RefreshCw size={18} color={theme.colors.primaryForeground} /><Text style={[theme.typography.button, { color: theme.colors.primaryForeground }]}>Try again</Text></Pressable> : null}</View>;
};

export const EmptyStatePanel = ({ title, message, actionLabel, onAction }: { title: string; message: string; actionLabel?: string; onAction?: () => void }) => {
  const { theme } = useAppTheme();
  return <View style={styles.center}><View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: theme.colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }}><Check size={24} color={theme.colors.foregroundMuted} /></View><Text style={[theme.typography.h3, { color: theme.colors.foreground, marginTop: 14, textAlign: 'center' }]}>{title}</Text><Text style={[theme.typography.body, { color: theme.colors.foregroundMuted, marginTop: 6, textAlign: 'center', maxWidth: 420 }]}>{message}</Text>{actionLabel && onAction ? <Pressable accessibilityRole="button" onPress={onAction} style={{ minHeight: 44, justifyContent: 'center', marginTop: 14 }}><Text style={[theme.typography.button, { color: theme.colors.primary }]}>{actionLabel}</Text></Pressable> : null}</View>;
};

export const ConfirmationDialog = ({ visible, title, message, confirmLabel = 'Confirm', destructive = false, busy = false, onConfirm, onCancel }: { visible: boolean; title: string; message: string; confirmLabel?: string; destructive?: boolean; busy?: boolean; onConfirm: () => void; onCancel: () => void }) => {
  const { theme } = useAppTheme();
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}><View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}><View accessibilityViewIsModal accessibilityRole="alert" style={{ width: '88%', maxWidth: 440, borderRadius: theme.radius['2xl'], padding: theme.spacing[5], backgroundColor: theme.colors.surface, ...theme.elevation.overlay }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.foreground, flex: 1 }]}>{title}</Text><IconButton label="Close dialog" onPress={onCancel}><X size={20} color={theme.colors.foregroundMuted} /></IconButton></View><Text style={[theme.typography.body, { color: theme.colors.foregroundMuted, marginTop: 8 }]}>{message}</Text><View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}><Pressable accessibilityRole="button" onPress={onCancel} disabled={busy} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 }}><Text style={[theme.typography.button, { color: theme.colors.foreground }]}>Cancel</Text></Pressable><Pressable accessibilityRole="button" onPress={onConfirm} disabled={busy} style={{ minHeight: 44, minWidth: 104, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, borderRadius: theme.radius.md, backgroundColor: destructive ? theme.colors.destructive : theme.colors.primary }}>{busy ? <ActivityIndicator color={destructive ? theme.colors.destructiveForeground : theme.colors.primaryForeground} /> : <Text style={[theme.typography.button, { color: destructive ? theme.colors.destructiveForeground : theme.colors.primaryForeground }]}>{confirmLabel}</Text>}</Pressable></View></View></View></Modal>;
};

const styles = StyleSheet.create({ center: { flex: 1, minHeight: 240, alignItems: 'center', justifyContent: 'center', padding: 24 }, modalOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 } });
