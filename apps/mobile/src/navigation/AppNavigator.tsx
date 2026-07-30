import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';
import type { RootStackParamList } from './types';

// Navigators
import { AuthStack } from './AuthStack';
import { StudentTabNavigator } from './StudentTabNavigator';
import { AdminDrawerNavigator } from './AdminDrawerNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated || !user ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : user.role === 'STUDENT' ? (
        <Stack.Screen name="StudentApp" component={StudentTabNavigator} />
      ) : (
        // For COORDINATOR and SUPER_ADMIN
        <Stack.Screen name="AdminApp" component={AdminDrawerNavigator} />
      )}
    </Stack.Navigator>
  );
};
