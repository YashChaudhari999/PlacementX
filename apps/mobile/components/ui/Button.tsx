import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'outline' && styles.outline,
    variant === 'danger' && styles.danger,
    variant === 'ghost' && styles.ghost,
    isDisabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    variant === 'outline' && styles.labelOutline,
    variant === 'danger' && styles.labelDanger,
    variant === 'ghost' && styles.labelGhost,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#4F46E5'} size="small" />
      ) : (
        <>
          {icon}
          <Text style={labelStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  primary: {
    backgroundColor: '#4F46E5',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#4F46E5',
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  labelOutline: {
    color: '#4F46E5',
  },
  labelDanger: {
    color: '#fff',
  },
  labelGhost: {
    color: '#64748B',
  },
});
