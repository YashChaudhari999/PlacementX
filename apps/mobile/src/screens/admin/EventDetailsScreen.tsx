import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { Building, MapPin, Calendar, Clock, DollarSign, Briefcase } from 'lucide-react-native';

import { theme } from '../../theme/theme';
import { Card, ScreenHeader, StatusBadge } from '../../components/ui';

export default function EventDetailsScreen() {
  const route = useRoute<any>();
  const id = route.params?.id;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Drive Details" showBack />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Text style={styles.title}>Drive Details - {id}</Text>
          <Text style={styles.subtitle}>This screen allows the admin to view drive details, manage applicants, and update status.</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing[4],
  },
  card: {
    padding: theme.spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.foreground,
    marginBottom: theme.spacing[4],
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
  },
});
