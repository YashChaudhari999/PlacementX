import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { AppTheme, createTheme, ResolvedThemeMode, ThemeMode } from './theme';

const STORAGE_KEY_PREFIX = 'placementx-theme-mode:';

interface ThemeContextValue {
  theme: AppTheme;
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  isHydrated: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const resolveMode = (mode: ThemeMode, system: ColorSchemeName): ResolvedThemeMode =>
  mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, mustChangePassword, hasHydrated: hasAuthHydrated } = useAuthStore();
  const accountId = isAuthenticated && !mustChangePassword ? user?.id ?? null : null;
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [loadedAccountId, setLoadedAccountId] = useState<string | null>(null);
  const [systemMode, setSystemMode] = useState<ColorSchemeName>(Appearance.getColorScheme());

  useEffect(() => {
    let active = true;
    setModeState('light');
    setLoadedAccountId(null);

    if (!accountId) return () => { active = false; };

    AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${accountId}`)
      .then(value => {
        if (!active) return;
        setModeState(value === 'light' || value === 'dark' || value === 'system' ? value : 'light');
      })
      .finally(() => {
        if (active) setLoadedAccountId(accountId);
      });

    return () => { active = false; };
  }, [accountId]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => setSystemMode(colorScheme));
    return () => subscription.remove();
  }, []);

  const setMode = useCallback(async (nextMode: ThemeMode) => {
    if (!accountId) return;
    setModeState(nextMode);
    setLoadedAccountId(accountId);
    await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${accountId}`, nextMode);
  }, [accountId]);

  const activeMode = accountId && loadedAccountId === accountId ? mode : 'light';
  const resolvedMode = resolveMode(activeMode, systemMode);
  const isHydrated = hasAuthHydrated && (!accountId || loadedAccountId === accountId);
  const value = useMemo<ThemeContextValue>(() => ({ theme: createTheme(resolvedMode), mode: activeMode, resolvedMode, setMode, isHydrated }), [activeMode, isHydrated, resolvedMode, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useAppTheme must be used inside ThemeProvider');
  return value;
};
