import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  ShieldCheck, 
  Calendar as CalendarIcon, 
  FileSpreadsheet,
  Bell,
  Settings as SettingsIcon 
} from 'lucide-react-native';

import { theme } from '../theme/theme';
import type { AdminDrawerParamList, AdminDrivesStackParamList } from './types';

// Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import DriveListScreen from '../screens/admin/DriveListScreen';
import CreateDriveScreen from '../screens/admin/CreateDriveScreen';
import EventDetailsScreen from '../screens/admin/EventDetailsScreen';
import AdminStudentsScreen from '../screens/admin/AdminStudentsScreen';
import AdminCalendarScreen from '../screens/admin/AdminCalendarScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import AdminNotificationsScreen from '../screens/admin/AdminNotificationsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';

const Drawer = createDrawerNavigator<AdminDrawerParamList>();
const DrivesStack = createNativeStackNavigator<AdminDrivesStackParamList>();

const DrivesStackNavigator = () => (
  <DrivesStack.Navigator screenOptions={{ headerShown: false }}>
    <DrivesStack.Screen name="DriveList" component={DriveListScreen} />
    <DrivesStack.Screen name="CreateDrive" component={CreateDriveScreen} />
    <DrivesStack.Screen name="EventDetails" component={EventDetailsScreen} />
  </DrivesStack.Navigator>
);

import { View, Text } from 'react-native';
import { useNotificationStore } from '../stores/notificationStore';

export const AdminDrawerNavigator = () => {
  const unreadCount = useNotificationStore(state => state.unreadCount);

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false, // We'll use our custom headers
        drawerActiveBackgroundColor: theme.colors.primary + '1A', // 10% opacity
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.foreground,
        drawerStyle: {
          backgroundColor: theme.colors.card,
          width: 280,
        },
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={AdminDashboardScreen} 
        options={{
          drawerIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Drawer.Screen 
        name="DrivesStack" 
        component={DrivesStackNavigator} 
        options={{
          title: 'Placement Drives',
          drawerIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
        }}
      />
      <Drawer.Screen 
        name="Students" 
        component={AdminStudentsScreen} 
        options={{
          drawerIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Drawer.Screen 
        name="Calendar" 
        component={AdminCalendarScreen} 
        options={{
          drawerIcon: ({ color, size }) => <CalendarIcon color={color} size={size} />,
        }}
      />
      <Drawer.Screen 
        name="Reports" 
        component={AdminReportsScreen} 
        options={{
          drawerIcon: ({ color, size }) => <FileSpreadsheet color={color} size={size} />,
        }}
      />
      <Drawer.Screen 
        name="Notifications" 
        component={AdminNotificationsScreen} 
        options={{
          drawerIcon: ({ color, size }) => <Bell color={color} size={size} />,
          drawerLabel: ({ color }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}>
              <Text style={{ color, fontWeight: '500' }}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={{ backgroundColor: theme.colors.error, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={AdminSettingsScreen} 
        options={{
          drawerIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />,
        }}
      />
    </Drawer.Navigator>
  );
};
