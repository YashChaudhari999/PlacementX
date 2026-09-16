import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, AppState, AppStateStatus, LogBox } from 'react-native';
import Toast from 'react-native-toast-message';

LogBox.ignoreLogs([
  'Reanimated',
  'Require cycle:',
  'Non-serializable values were found in the navigation state',
]);

import { AppNavigator } from './src/navigation/AppNavigator';
import { theme } from './src/theme/theme';
import { NotificationProvider } from './src/providers/NotificationProvider';
import { useAuthStore } from './src/stores/authStore';
import { ErrorBoundary } from './src/components/ErrorBoundary';

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

export default function App() {
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
            barStyle="dark-content"
            backgroundColor={theme.colors.background}
          />
          <NavigationContainer>
            <NotificationProvider>
              <AppNavigator />
            </NotificationProvider>
          </NavigationContainer>
          <Toast />
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
