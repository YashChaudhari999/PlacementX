// @ts-nocheck
import { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth/contexts/AuthContext';
import { SessionProvider } from '@/features/auth/contexts/SessionContext';
import { RoleProvider } from '@/features/auth/contexts/RoleContext';
import { PermissionProvider } from '@/features/auth/contexts/PermissionContext';
import { AppShellProvider } from '@/app/shell/contexts/AppShellContext';
import { ToastProvider } from '@/app/shell/components/ToastProvider';
import { DialogProvider } from '@/app/shell/components/DialogProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Wrapping order is critical: Auth -> Session -> Roles -> Permissions -> AppShell -> UI Providers
export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
};
