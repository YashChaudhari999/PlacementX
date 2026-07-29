import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { theme } from '../../theme/theme';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = ({
  children,
  variant = 'default',
  size = 'default',
  isLoading,
  style,
  disabled,
  ...props
}: ButtonProps) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'secondary': return theme.colors.secondary;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      case 'destructive': return theme.colors.destructive;
      default: return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary': return theme.colors.secondaryForeground;
      case 'outline': return theme.colors.foreground;
      case 'ghost': return theme.colors.foreground;
      case 'destructive': return theme.colors.destructiveForeground;
      default: return theme.colors.primaryForeground;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') return theme.colors.border;
    return 'transparent';
  };

  const getHeight = () => {
    switch (size) {
      case 'sm': return 36;
      case 'lg': return 56;
      case 'icon': return 40;
      default: return 48; // Standard h-12 in web
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return theme.spacing[3];
      case 'lg': return theme.spacing[8];
      case 'icon': return 0;
      default: return theme.spacing[4];
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          height: getHeight(),
          paddingHorizontal: getPadding(),
          width: size === 'icon' ? getHeight() : undefined,
          opacity: disabled || isLoading ? 0.7 : 1,
        },
        style,
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : typeof children === 'string' ? (
        <Text style={[styles.text, { color: getTextColor(), fontSize: size === 'sm' ? 14 : 16 }]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});
