import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, AppState, AppStateStatus, LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import * as Linking from 'expo-linking';

LogBox.ignoreLogs([
  'Reanimated',
  'Require cycle:',
  'Non-serializable values were found in the navigation state',
]);

import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeProvider';
import { NotificationProvider } from './src/providers/NotificationProvider';
import { useAuthStore } from './src/stores/authStore';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import type { RootStackParamList } from './src/navigation/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'placementx://'],
  config: {
    screens: {
      Auth: { screens: { Login: 'login' } },
      FirstLoginPassword: 'change-password',
      StudentApp: {
        screens: {
          HomeStack: { screens: { Dashboard: 'student', DriveDetails: 'student/drives/:id' } },
          Drives: 'student/drives',
          Calendar: 'student/calendar',
          Notifications: 'student/notifications',
          ProfileStack: { screens: { ProfileHome: 'student/profile', Documents: 'student/documents', Interviews: 'student/interviews', Settings: 'student/settings', NotificationPreferences: 'student/settings/notifications' } },
        },
      },
      AdminApp: { screens: { Dashboard: 'admin', Students: 'admin/students', Calendar: 'admin/calendar', Reports: 'admin/reports', Notifications: 'admin/notifications', Settings: 'admin/settings', Coordinators: 'admin/coordinators' } },
    },
  },
};

const AppContent = () => {
  const { theme, resolvedMode } = useAppTheme();
  const logout = useAuthStore(state => state.logout);

  React.useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Enforce high-security: clear sensitive tokens when app is backgrounded
        // In a real production app, this might just lock the screen with biometrics instead
        // logout(); 
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [logout]);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <StatusBar
            barStyle={resolvedMode === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={theme.colors.background}
          />
          <NavigationContainer
            linking={linking}
            theme={{
              dark: resolvedMode === 'dark',
              colors: { primary: theme.colors.primary, background: theme.colors.background, card: theme.colors.surface, text: theme.colors.foreground, border: theme.colors.border, notification: theme.colors.destructive },
              fonts: { regular: { fontFamily: 'System', fontWeight: '400' }, medium: { fontFamily: 'System', fontWeight: '500' }, bold: { fontFamily: 'System', fontWeight: '700' }, heavy: { fontFamily: 'System', fontWeight: '800' } },
            }}
          >
            <NotificationProvider>
              <AppNavigator />
            </NotificationProvider>
          </NavigationContainer>
          <Toast />
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
