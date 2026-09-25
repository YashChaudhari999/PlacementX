import React from 'react';
import { View, Text } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LayoutDashboard, Briefcase, Users, Calendar as CalendarIcon, FileSpreadsheet, Bell, Settings as SettingsIcon } from 'lucide-react-native';

import { useAppTheme } from '../theme/ThemeProvider';
import type { AdminDrawerParamList, AdminDrivesStackParamList } from './types';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import DriveListScreen from '../screens/admin/DriveListScreen';
import CreateDriveScreen from '../screens/admin/CreateDriveScreen';
import EventDetailsScreen from '../screens/admin/EventDetailsScreen';
import AdminStudentsScreen from '../screens/admin/AdminStudentsScreen';
import AdminCalendarScreen from '../screens/admin/AdminCalendarScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import AdminNotificationsScreen from '../screens/admin/AdminNotificationsScreen';
import AdminCoordinatorsScreen from '../screens/admin/AdminCoordinatorsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import { useNotificationStore } from '../stores/notificationStore';
import { useAuthStore } from '../stores/authStore';

const Drawer = createDrawerNavigator<AdminDrawerParamList>();
const DrivesStack = createNativeStackNavigator<AdminDrivesStackParamList>();

const DrivesStackNavigator = () => (
  <DrivesStack.Navigator screenOptions={{ headerShown: false }}>
    <DrivesStack.Screen name="DriveList" component={DriveListScreen} />
    <DrivesStack.Screen name="CreateDrive" component={CreateDriveScreen} />
    <DrivesStack.Screen name="EventDetails" component={EventDetailsScreen} />
  </DrivesStack.Navigator>
);

export const AdminDrawerNavigator = () => {
  const { theme } = useAppTheme();
  const unreadCount = useNotificationStore(state => state.unreadCount);
  const isSuperAdmin = useAuthStore(state => state.user?.role === 'SUPER_ADMIN');
  const icon = (Icon: typeof Users) => ({ color, size }: { color: string; size: number }) => <Icon color={color} size={size} />;

  return (
    <Drawer.Navigator
      initialRouteName={isSuperAdmin ? 'Dashboard' : 'Students'}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: theme.colors.primary + '1A',
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.foreground,
        drawerStyle: { backgroundColor: theme.colors.card, width: 280 },
      }}
    >
      {isSuperAdmin ? (
        <>
          <Drawer.Screen name="Dashboard" component={AdminDashboardScreen} options={{ drawerIcon: icon(LayoutDashboard) }} />
          <Drawer.Screen name="DrivesStack" component={DrivesStackNavigator} options={{ title: 'Placement Drives', drawerIcon: icon(Briefcase) }} />
        </>
      ) : null}
      <Drawer.Screen name="Students" component={AdminStudentsScreen} options={{ drawerIcon: icon(Users) }} />
      {isSuperAdmin ? (
        <>
          <Drawer.Screen name="Calendar" component={AdminCalendarScreen} options={{ drawerIcon: icon(CalendarIcon) }} />
          <Drawer.Screen name="Reports" component={AdminReportsScreen} options={{ drawerIcon: icon(FileSpreadsheet) }} />
          <Drawer.Screen name="Coordinators" component={AdminCoordinatorsScreen} options={{ drawerIcon: icon(Users) }} />
          <Drawer.Screen
            name="Notifications"
            component={AdminNotificationsScreen}
            options={{
              drawerIcon: icon(Bell),
              drawerLabel: ({ color }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}>
                  <Text style={{ color, fontWeight: '500' }}>Notifications</Text>
                  {unreadCount > 0 ? <View style={{ backgroundColor: theme.colors.error, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}><Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{unreadCount > 99 ? '99+' : unreadCount}</Text></View> : null}
                </View>
              ),
            }}
          />
        </>
      ) : null}
      <Drawer.Screen name="Settings" component={AdminSettingsScreen} options={{ drawerIcon: icon(SettingsIcon) }} />
    </Drawer.Navigator>
  );
};
