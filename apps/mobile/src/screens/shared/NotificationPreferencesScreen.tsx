// ─── Notification Preferences Screen ────────────────────
// Settings screen for granular notification control.
// Users can toggle individual categories and channels.

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, Bell, BellOff, Mail, Smartphone,
  Briefcase, Calendar, Users, BookOpen,
  MessageSquare, Megaphone, ShoppingCart, Shield,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { theme } from '../../theme/theme';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '../../hooks/queries/useNotifications';

// ─── Category Config ────────────────────────────────────

const CATEGORIES = [
  { key: 'placement', label: 'Placement Drives', desc: 'New drives, registrations, updates', icon: Briefcase, color: '#4f46e5' },
  { key: 'interviews', label: 'Interviews', desc: 'Scheduled interviews, reminders', icon: Calendar, color: '#9333ea' },
  { key: 'meetings', label: 'Meetings', desc: 'Meeting invites, reminders', icon: Users, color: '#0891b2' },
  { key: 'messages', label: 'Messages', desc: 'Direct messages, chat', icon: MessageSquare, color: '#7c3aed' },
  { key: 'assignments', label: 'Assignments', desc: 'Submissions, deadlines', icon: BookOpen, color: '#ea580c' },
  { key: 'marketing', label: 'Marketing', desc: 'Tips, features, updates', icon: Megaphone, color: '#2563eb' },
  { key: 'promotions', label: 'Promotions', desc: 'Offers, events', icon: ShoppingCart, color: '#0284c7' },
  { key: 'system', label: 'System', desc: 'Security, maintenance, alerts', icon: Shield, color: '#64748b' },
];

// ─── Component ──────────────────────────────────────────

export default function NotificationPreferencesScreen() {
  const navigation = useNavigation();
  const { data: prefs, isLoading } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();
  
  const [localPrefs, setLocalPrefs] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize local state from server data
  useEffect(() => {
    if (prefs) {
      setLocalPrefs({
        placement: prefs.placement,
        interviews: prefs.interviews,
        meetings: prefs.meetings,
        messages: prefs.messages,
        assignments: prefs.assignments,
        marketing: prefs.marketing,
        promotions: prefs.promotions,
        system: prefs.system,
        pushEnabled: prefs.pushEnabled,
        emailEnabled: prefs.emailEnabled,
      });
    }
  }, [prefs]);

  const togglePref = (key: string) => {
    setLocalPrefs(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      setHasChanges(true);
      return updated;
    });
  };

  const handleSave = () => {
    updatePrefs.mutate(localPrefs, {
      onSuccess: () => {
        setHasChanges(false);
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ─── Master Toggles ──────────────────────────── */}
        <Text style={styles.sectionLabel}>CHANNELS</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <View style={[styles.toggleIcon, { backgroundColor: '#e0e7ff' }]}>
                <Smartphone size={20} color="#4f46e5" />
              </View>
              <View>
                <Text style={styles.toggleLabel}>Push Notifications</Text>
                <Text style={styles.toggleDesc}>Receive alerts on this device</Text>
              </View>
            </View>
            <Switch
              value={localPrefs.pushEnabled ?? true}
              onValueChange={() => togglePref('pushEnabled')}
              trackColor={{ false: '#e2e8f0', true: '#c7d2fe' }}
              thumbColor={localPrefs.pushEnabled ? '#4f46e5' : '#94a3b8'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <View style={[styles.toggleIcon, { backgroundColor: '#fef3c7' }]}>
                <Mail size={20} color="#d97706" />
              </View>
              <View>
                <Text style={styles.toggleLabel}>Email Notifications</Text>
                <Text style={styles.toggleDesc}>Receive email digests</Text>
              </View>
            </View>
            <Switch
              value={localPrefs.emailEnabled ?? true}
              onValueChange={() => togglePref('emailEnabled')}
              trackColor={{ false: '#e2e8f0', true: '#fde68a' }}
              thumbColor={localPrefs.emailEnabled ? '#d97706' : '#94a3b8'}
            />
          </View>
        </View>

        {/* ─── Category Toggles ────────────────────────── */}
        <Text style={styles.sectionLabel}>CATEGORIES</Text>
        <View style={styles.card}>
          {CATEGORIES.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <React.Fragment key={cat.key}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleInfo}>
                    <View style={[styles.toggleIcon, { backgroundColor: `${cat.color}15` }]}>
                      <Icon size={20} color={cat.color} />
                    </View>
                    <View>
                      <Text style={styles.toggleLabel}>{cat.label}</Text>
                      <Text style={styles.toggleDesc}>{cat.desc}</Text>
                    </View>
                  </View>
                  <Switch
                    value={localPrefs[cat.key] ?? true}
                    onValueChange={() => togglePref(cat.key)}
                    trackColor={{ false: '#e2e8f0', true: `${cat.color}40` }}
                    thumbColor={localPrefs[cat.key] ? cat.color : '#94a3b8'}
                  />
                </View>
              </React.Fragment>
            );
          })}
        </View>

        {/* ─── Info Note ───────────────────────────────── */}
        <View style={styles.infoCard}>
          <BellOff size={16} color="#94a3b8" />
          <Text style={styles.infoText}>
            Disabling a category will prevent notifications from being sent for that type.
            System notifications like security alerts cannot be fully disabled.
          </Text>
        </View>

        {/* Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ─── Save Button ───────────────────────────────── */}
      {hasChanges && (
        <View style={styles.saveContainer}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={updatePrefs.isPending}
          >
            {updatePrefs.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  scrollContent: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 8,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  toggleDesc: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    fontWeight: '500',
  },
  saveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
