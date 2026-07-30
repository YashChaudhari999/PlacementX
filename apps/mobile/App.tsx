import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

import { AppNavigator } from './src/navigation/AppNavigator';
import { theme } from './src/theme/theme';
import { NotificationProvider } from './src/providers/NotificationProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
    },
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
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
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
