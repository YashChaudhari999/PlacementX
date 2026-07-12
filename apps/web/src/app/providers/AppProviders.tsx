import { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth/contexts/AuthContext';
import { SessionProvider } from '@/features/auth/contexts/SessionContext';
import { RoleProvider } from '@/features/auth/contexts/RoleContext';
import { PermissionProvider } from '@/features/auth/contexts/PermissionContext';
import { AppShellProvider } from '@/app/shell/contexts/AppShellContext';
import { ToastProvider } from '@/app/shell/components/ToastProvider';
import { DialogProvider } from '@/app/shell/components/DialogProvider';

// Wrapping order is critical: Auth -> Session -> Roles -> Permissions -> AppShell -> UI Providers
export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <SessionProvider>
        <RoleProvider>
          <PermissionProvider>
            <AppShellProvider>
              <ToastProvider>
                <DialogProvider>
                  {children}
                </DialogProvider>
              </ToastProvider>
            </AppShellProvider>
          </PermissionProvider>
        </RoleProvider>
      </SessionProvider>
    </AuthProvider>
  );
};
