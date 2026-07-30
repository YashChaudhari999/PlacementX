import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Download, CheckCircle, Clock } from 'lucide-react-native';

import { theme } from '../../theme/theme';
import { Card, ScreenHeader, ListSkeleton, EmptyState, Badge } from '../../components/ui';
import { useStudentDocuments } from '../../hooks/queries';

export default function DocumentsScreen() {
  const { data: documents, isLoading, refetch } = useStudentDocuments();

  const handleDownload = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        // Handle error if URL cannot be opened
      });
    }
  };

  const renderDocumentCard = ({ item }: { item: any }) => {
    const isVerified = item.isVerified;

    return (
      <Card style={styles.card}>
        <View style={styles.iconContainer}>
          <FileText size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.fileName} numberOfLines={1}>
            {item.name || `${item.type} Document`}
          </Text>
          <View style={styles.statusRow}>
            {isVerified ? (
              <>
                <CheckCircle size={14} color={theme.colors.success} />
                <Text style={[styles.statusText, { color: theme.colors.success }]}>Verified</Text>
              </>
            ) : (
              <>
                <Clock size={14} color={theme.colors.warning || '#F59E0B'} />
                <Text style={[styles.statusText, { color: theme.colors.warning || '#F59E0B' }]}>Pending Verification</Text>
              </>
            )}
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={() => handleDownload(item.url)}
        >
          <Download size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="My Documents" showBack />
      
      {isLoading ? (
        <ListSkeleton />
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          renderItem={renderDocumentCard}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
          ListEmptyComponent={
            <EmptyState
              icon={<FileText size={48} color={theme.colors.mutedForeground} />}
              title="No Documents Uploaded"
              description="You have not uploaded any documents such as resumes or certificates yet."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: theme.spacing[4],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary + '1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[4],
  },
  contentContainer: {
    flex: 1,
    marginRight: theme.spacing[4],
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.foreground,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  downloadButton: {
    padding: theme.spacing[2],
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.full || 9999,
  },
});
