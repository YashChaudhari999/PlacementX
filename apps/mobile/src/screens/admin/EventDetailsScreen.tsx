import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Building2, MapPin, CalendarDays, IndianRupee, Users } from 'lucide-react-native';

import type { AppTheme } from '../../theme/theme';
import { useAppTheme } from '../../theme/ThemeProvider';
import { ScreenContainer, PageHeader, SurfaceCard, StatusBadge, LoadingState, ErrorState } from '../../components/ui';
import { useDriveDetails } from '../../hooks/queries';
import type { AdminDrivesStackParamList } from '../../navigation/types';

export default function EventDetailsScreen() {
  const { theme } = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const { params } = useRoute<RouteProp<AdminDrivesStackParamList, 'EventDetails'>>();
  const { data: drive, isLoading, isError, refetch } = useDriveDetails(params.id);

  if (isLoading) return <ScreenContainer><PageHeader title="Drive details" showBack /><LoadingState label="Loading drive" /></ScreenContainer>;
  if (isError || !drive) return <ScreenContainer><PageHeader title="Drive details" showBack /><ErrorState message="This drive could not be loaded." onRetry={refetch} /></ScreenContainer>;

  const facts = [
    { icon: Building2, label: 'Role', value: drive.jobRole },
    { icon: MapPin, label: 'Location', value: drive.location || 'To be announced' },
    { icon: CalendarDays, label: 'Registration closes', value: drive.registrationEnd ? new Date(drive.registrationEnd).toLocaleString() : 'To be announced' },
    { icon: IndianRupee, label: 'Fixed salary', value: drive.fixedSalary ? `₹${Number(drive.fixedSalary).toLocaleString('en-IN')}` : 'Not disclosed' },
    { icon: Users, label: 'Applications', value: `${drive.applications?.length ?? 0}` },
  ];

  return (
    <ScreenContainer>
      <PageHeader title="Drive details" subtitle="Administrative overview" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.monogram}><Text style={styles.monogramText}>{drive.company?.name?.charAt(0)?.toUpperCase() || 'P'}</Text></View>
          <View style={styles.heroCopy}><Text style={styles.company}>{drive.company?.name || 'Company'}</Text><Text style={styles.role}>{drive.jobRole}</Text></View>
          <StatusBadge status={drive.status} />
        </View>
        <SurfaceCard style={styles.card}>
          {facts.map(({ icon: Icon, label, value }) => <View key={label} style={styles.fact}><Icon size={19} color={theme.colors.primary} /><View><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View></View>)}
        </SurfaceCard>
        {drive.jobDescription ? <SurfaceCard style={styles.card}><Text style={styles.sectionTitle}>Role brief</Text><Text style={styles.description}>{drive.jobDescription}</Text></SurfaceCard> : null}
        {drive.selectionRounds?.length ? <SurfaceCard style={styles.card}><Text style={styles.sectionTitle}>Selection rounds</Text>{drive.selectionRounds.map((round, index) => <View key={round.id} style={styles.round}><Text style={styles.roundNumber}>{index + 1}</Text><View><Text style={styles.value}>{round.title}</Text><Text style={styles.label}>{round.date || 'Date pending'}{round.venue ? ` · ${round.venue}` : ''}</Text></View></View>)}</SurfaceCard> : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  content: { padding: theme.spacing[4], paddingBottom: 40 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  heroCopy: { flex: 1 },
  monogram: { width: 54, height: 54, borderRadius: 16, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  monogramText: { color: theme.colors.primaryForeground, fontSize: 22, fontWeight: '800' },
  company: { color: theme.colors.foreground, fontSize: 22, fontWeight: '800' },
  role: { color: theme.colors.mutedForeground, fontSize: 14, marginTop: 2 },
  card: { marginBottom: 14, gap: 18 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { color: theme.colors.mutedForeground, fontSize: 12, marginBottom: 2 },
  value: { color: theme.colors.foreground, fontSize: 15, fontWeight: '600' },
  sectionTitle: { color: theme.colors.foreground, fontSize: 17, fontWeight: '700' },
  description: { color: theme.colors.mutedForeground, fontSize: 14, lineHeight: 21 },
  round: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roundNumber: { width: 30, height: 30, borderRadius: 15, textAlign: 'center', textAlignVertical: 'center', backgroundColor: theme.colors.primary + '15', color: theme.colors.primary, fontWeight: '700' },
});
