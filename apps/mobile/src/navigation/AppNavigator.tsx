import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';
import type { RootStackParamList } from './types';

// Navigators
import { AuthStack } from './AuthStack';
import { StudentTabNavigator } from './StudentTabNavigator';
import { AdminDrawerNavigator } from './AdminDrawerNavigator';

// Screens
import { LoadingState } from '../components/ui';
import ChangePasswordScreen from '../screens/auth/ChangePasswordScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { isAuthenticated, user, mustChangePassword, hasHydrated } = useAuthStore();

  if (!hasHydrated) return <LoadingState label="Restoring your session" />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {!isAuthenticated || !user ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : mustChangePassword ? (
        <Stack.Screen name="FirstLoginPassword" component={ChangePasswordScreen} />
      ) : user.role === 'STUDENT' ? (
        <Stack.Screen name="StudentApp" component={StudentTabNavigator} />
      ) : (
        // For COORDINATOR and SUPER_ADMIN
        <Stack.Screen name="AdminApp" component={AdminDrawerNavigator} />
      )}
    </Stack.Navigator>
  );
};
