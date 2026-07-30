import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { theme } from '../../theme/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchBar = ({ value, onChangeText, placeholder = 'Search...', debounceMs = 300 }: SearchBarProps) => {
  const [localValue, setLocalValue] = useState(value);

  // Update local value when prop changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce the onChangeText callback
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChangeText(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [localValue, onChangeText, value, debounceMs]);

  const handleClear = () => {
    setLocalValue('');
    onChangeText('');
  };

  return (
    <View style={styles.container}>
      <Search color={theme.colors.mutedForeground} size={20} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.mutedForeground}
        value={localValue}
        onChangeText={setLocalValue}
        returnKeyType="search"
      />
      {localValue.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <X color={theme.colors.mutedForeground} size={16} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 40,
    paddingHorizontal: theme.spacing[3],
  },
  icon: {
    marginRight: theme.spacing[2],
  },
  input: {
    flex: 1,
    height: '100%',
    color: theme.colors.foreground,
    fontSize: 14,
    padding: 0, // Remove default Android padding
  },
  clearButton: {
    padding: theme.spacing[1],
    marginLeft: theme.spacing[2],
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.full || 9999,
  },
});
