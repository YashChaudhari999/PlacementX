import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
};

// ─── Student Navigation ────────────────────────────────

export type HomeStackParamList = {
  Dashboard: undefined;
  DriveDetails: { id: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Documents: undefined;
  Interviews: undefined;
};

export type StudentTabParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  Drives: undefined;
  Notifications: undefined;
  ProfileStack: NavigatorScreenParams<ProfileStackParamList>;
  Settings: undefined;
};

// ─── Admin Navigation ──────────────────────────────────

export type AdminDrivesStackParamList = {
  DriveList: undefined;
  CreateDrive: undefined;
  EventDetails: { id: string };
};

export type AdminDrawerParamList = {
  Dashboard: undefined;
  DrivesStack: NavigatorScreenParams<AdminDrivesStackParamList>;
  Students: undefined;
  Calendar: undefined;
  Reports: undefined;
  Notifications: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  StudentApp: NavigatorScreenParams<StudentTabParamList>;
  AdminApp: NavigatorScreenParams<AdminDrawerParamList>;
};
