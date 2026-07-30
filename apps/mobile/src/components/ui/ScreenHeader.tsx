import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export const ScreenHeader = ({ title, subtitle, showBack = false, rightElement }: ScreenHeaderProps) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        {showBack && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft color={theme.colors.foreground} size={24} />
          </TouchableOpacity>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>
      </View>
      
      {rightElement && (
        <View style={styles.rightContent}>
          {rightElement}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: theme.spacing[3],
    padding: theme.spacing[1],
    borderRadius: theme.radius.full || 9999,
    backgroundColor: theme.colors.muted,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  rightContent: {
    marginLeft: theme.spacing[4],
  },
});
