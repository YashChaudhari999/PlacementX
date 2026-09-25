import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Download, CheckCircle } from 'lucide-react-native';

import type { AppTheme } from '../../theme/theme';
import { useAppTheme } from '../../theme/ThemeProvider';
import { Card, ScreenHeader, ListSkeleton, EmptyState, ErrorState } from '../../components/ui';
import { useStudentDocuments } from '../../hooks/queries';

type DocumentItem = { id: string; name: string; url: string; kind: 'Academic record' | 'Offer letter' };

export default function DocumentsScreen() {
  const { theme } = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const { data: documents, isLoading, isError, refetch, isRefetching } = useStudentDocuments();
  const items: DocumentItem[] = [
    ...(documents?.academicDocuments || []).map(doc => ({ id: doc.id, name: doc.fileName || doc.documentType.replaceAll('_', ' '), url: doc.signedUrl, kind: 'Academic record' as const })),
    ...(documents?.offers || []).filter(offer => offer.offerLetterUrl).map(offer => ({ id: offer.id, name: `${offer.company} — ${offer.role}`, url: offer.offerLetterUrl!, kind: 'Offer letter' as const })),
  ];

  const openDocument = async (item: DocumentItem) => {
    if (await Linking.canOpenURL(item.url)) await Linking.openURL(item.url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Document vault" showBack />
      {isLoading ? <ListSkeleton /> : isError ? (
        <ErrorState message="Your document vault could not be loaded." onRetry={refetch} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.iconContainer}><FileText size={24} color={theme.colors.primary} /></View>
              <View style={styles.contentContainer}>
                <Text style={styles.fileName} numberOfLines={2}>{item.name}</Text>
                <View style={styles.statusRow}><CheckCircle size={14} color={theme.colors.success} /><Text style={styles.statusText}>{item.kind} available</Text></View>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`Open ${item.name}`} hitSlop={8} onPress={() => openDocument(item)} style={({ pressed }) => [styles.downloadButton, pressed && styles.pressed]}>
                <Download size={20} color={theme.colors.primary} />
              </Pressable>
            </Card>
          )}
          ListEmptyComponent={<EmptyState icon={<FileText size={48} color={theme.colors.mutedForeground} />} title="No documents yet" description="Academic records and offer letters will appear here when they are available." />}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  listContent: { padding: theme.spacing[4], flexGrow: 1 },
  card: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing[4], marginBottom: theme.spacing[3] },
  iconContainer: { width: 48, height: 48, borderRadius: theme.radius.md, backgroundColor: theme.colors.primary + '1A', justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing[4] },
  contentContainer: { flex: 1, marginRight: theme.spacing[3] },
  fileName: { fontSize: 16, fontWeight: '600', color: theme.colors.foreground, marginBottom: 5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusText: { fontSize: 12, fontWeight: '500', color: theme.colors.success },
  downloadButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.muted, borderRadius: theme.radius.full },
  pressed: { opacity: 0.65 },
});
