import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { AppTheme, createTheme, ResolvedThemeMode, ThemeMode } from './theme';

const STORAGE_KEY = 'placementx-theme-mode';

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
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [systemMode, setSystemMode] = useState<ColorSchemeName>(Appearance.getColorScheme());
  const [isHydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(value => {
        if (value === 'light' || value === 'dark' || value === 'system') setModeState(value);
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => setSystemMode(colorScheme));
    return () => subscription.remove();
  }, []);

  const setMode = useCallback(async (nextMode: ThemeMode) => {
    setModeState(nextMode);
    await AsyncStorage.setItem(STORAGE_KEY, nextMode);
  }, []);

  const resolvedMode = resolveMode(mode, systemMode);
  const value = useMemo<ThemeContextValue>(() => ({ theme: createTheme(resolvedMode), mode, resolvedMode, setMode, isHydrated }), [isHydrated, mode, resolvedMode, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useAppTheme must be used inside ThemeProvider');
  return value;
};
