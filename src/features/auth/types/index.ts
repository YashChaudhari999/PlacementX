export type Role = 'student' | 'admin';

export type StudentPermission = 'view:profile' | 'update:profile' | 'action:apply' | 'view:notifications';
export type AdminPermission = 'manage:students' | 'approve:drives' | 'publish:drives' | 'manage:notifications' | 'manage:settings';
export type Permission = StudentPermission | AdminPermission;

export interface Session {
  token: string;
  expiresAt: number;
  refreshToken: string;
  isValid: boolean;
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  providerId?: 'password' | 'google.com' | 'microsoft.com';
}

export type AuthErrorType = 'unauthenticated' | 'unauthorized' | 'session_expired' | 'network_error' | 'account_disabled';

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: AuthErrorType | null;
}

export interface RoleState {
  role: Role | null;
  isLoading: boolean;
}

export interface PermissionState {
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
}
