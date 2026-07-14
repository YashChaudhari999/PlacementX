// @ts-nocheck
import { createContext, useState, ReactNode } from 'react';

export interface AppShellState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  pageTitle: string;
  setPageTitle: (v: string) => void;
  themeMode: 'light' | 'dark' | 'system';
  setThemeMode: (v: 'light' | 'dark' | 'system') => void;
  globalLoading: boolean;
  setGlobalLoading: (v: boolean) => void;
  notificationDrawerOpen: boolean;
  setNotificationDrawerOpen: (v: boolean) => void;
}

export const AppShellContext = createContext<AppShellState | undefined>(undefined);

export const AppShellProvider = ({ children }: { children: ReactNode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  const [globalLoading, setGlobalLoading] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  return (
    <AppShellContext.Provider value={{
      sidebarCollapsed, setSidebarCollapsed,
      pageTitle, setPageTitle,
      themeMode, setThemeMode,
      globalLoading, setGlobalLoading,
      notificationDrawerOpen, setNotificationDrawerOpen
    }}>
      {children}
    </AppShellContext.Provider>
  );
};
