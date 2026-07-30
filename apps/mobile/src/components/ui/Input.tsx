import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { theme } from '../../theme/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = ({ label, error, icon, secureTextEntry, style, ...props }: InputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = secureTextEntry !== undefined ? secureTextEntry : false;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        error ? styles.inputError : null,
        props.editable === false ? styles.inputDisabled : null
      ]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        
        <TextInput
          style={[
            styles.input,
            icon ? styles.inputWithIcon : null,
            isPassword ? styles.inputWithPasswordIcon : null,
            style
          ]}
          placeholderTextColor={theme.colors.mutedForeground}
          secureTextEntry={isPassword && !isPasswordVisible}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity 
            style={styles.passwordIconContainer}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            {isPasswordVisible ? (
              <EyeOff color={theme.colors.mutedForeground} size={20} />
            ) : (
              <Eye color={theme.colors.mutedForeground} size={20} />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[4],
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.foreground,
    marginBottom: theme.spacing[2],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    height: 48,
  },
  inputError: {
    borderColor: theme.colors.destructive,
  },
  inputDisabled: {
    backgroundColor: theme.colors.background,
    opacity: 0.7,
  },
  iconContainer: {
    paddingLeft: theme.spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: theme.spacing[3],
    color: theme.colors.foreground,
    fontSize: 16,
  },
  inputWithIcon: {
    paddingLeft: theme.spacing[2],
  },
  inputWithPasswordIcon: {
    paddingRight: theme.spacing[10], // space for the eye icon
  },
  passwordIconContainer: {
    position: 'absolute',
    right: 0,
    height: '100%',
    paddingHorizontal: theme.spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.destructive,
    marginTop: theme.spacing[1],
  },
});
