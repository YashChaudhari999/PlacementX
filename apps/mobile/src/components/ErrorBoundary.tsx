import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { AlertTriangle, RefreshCcw } from 'lucide-react-native';
import { useAppTheme } from '../theme/ThemeProvider';
import type { AppTheme } from '../theme/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

const ErrorFallback = ({ error, onReset }: ErrorFallbackProps) => {
  const { theme } = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <AlertTriangle size={48} color={theme.colors.destructive} />
        </View>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          We're sorry, an unexpected error occurred. Please try restarting the app.
        </Text>

        {__DEV__ && error && (
          <View style={styles.devErrorBox}>
            <Text style={styles.devErrorTitle}>Developer Error Info:</Text>
            <Text style={styles.devErrorText}>{error.toString()}</Text>
          </View>
        )}

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Try again"
          style={styles.button}
          onPress={onReset}
          activeOpacity={0.8}
        >
          <RefreshCcw size={20} color={theme.colors.primaryForeground} />
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[6],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.destructive + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[6],
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.foreground,
    marginBottom: theme.spacing[3],
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: theme.colors.foregroundMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing[8],
  },
  devErrorBox: {
    width: '100%',
    padding: theme.spacing[4],
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing[6],
  },
  devErrorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.destructive,
    marginBottom: theme.spacing[2],
  },
  devErrorText: {
    fontSize: 12,
    color: theme.colors.foreground,
    fontFamily: 'monospace',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[8],
    borderRadius: theme.radius.md,
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primaryForeground,
  },
});
