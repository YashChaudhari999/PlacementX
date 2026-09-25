import React from 'react';
import { Pressable, Text } from 'react-native';
import { useAppTheme } from '../../theme/ThemeProvider';

export interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  accessibilityHint?: string;
}

export const FilterChip = ({ label, selected = false, onPress, accessibilityHint }: FilterChipProps) => {
  const { theme } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: 15,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Text style={[theme.typography.label, { color: selected ? theme.colors.primaryForeground : theme.colors.foreground }]}>{label}</Text>
    </Pressable>
  );
};
