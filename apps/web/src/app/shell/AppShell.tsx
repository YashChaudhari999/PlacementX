// @ts-nocheck
import { ReactNode } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalLoader } from './components/GlobalLoader';
import { NotificationDrawer } from './components/NotificationDrawer';

export const AppShell = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundary>
      <div className="app-shell-root relative flex flex-col min-h-screen w-full bg-background text-foreground">
        <GlobalLoader />
        {children}
        <NotificationDrawer />
        {/* Future AI Assistant Overlay Placeholder */}
      </div>
    </ErrorBoundary>
  );
};
