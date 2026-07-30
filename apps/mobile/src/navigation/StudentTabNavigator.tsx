import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Briefcase, Bell, User, Settings as SettingsIcon } from 'lucide-react-native';

import { theme } from '../theme/theme';
import type { StudentTabParamList, HomeStackParamList, ProfileStackParamList } from './types';

// Screens
import DashboardScreen from '../screens/student/DashboardScreen';
import DriveDetailsScreen from '../screens/student/DriveDetailsScreen';
import ApplicationsScreen from '../screens/student/ApplicationsScreen';
import NotificationsScreen from '../screens/student/NotificationsScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import DocumentsScreen from '../screens/student/DocumentsScreen';
import InterviewsScreen from '../screens/student/InterviewsScreen';
import SettingsScreen from '../screens/student/SettingsScreen';

const Tab = createBottomTabNavigator<StudentTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Dashboard" component={DashboardScreen} />
    <HomeStack.Screen name="DriveDetails" component={DriveDetailsScreen} />
  </HomeStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
    <ProfileStack.Screen name="Documents" component={DocumentsScreen} />
    <ProfileStack.Screen name="Interviews" component={InterviewsScreen} />
  </ProfileStack.Navigator>
);

import { useNotificationStore } from '../stores/notificationStore';

export const StudentTabNavigator = () => {
  const unreadCount = useNotificationStore(state => state.unreadCount);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Drives"
        component={ApplicationsScreen}
        options={{
          tabBarLabel: 'Drives',
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
          tabBarBadgeStyle: { backgroundColor: theme.colors.error, color: 'white' },
        }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};
