import { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderState {
 theme: Theme;
 setTheme: (theme: Theme) => void;
 compactMode: boolean;
 setCompactMode: (compact: boolean) => void;
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

const isTheme = (value: string | null): value is Theme =>
 value === 'light' || value === 'dark' || value === 'system';

const preferenceKey = (userId: string | undefined, preference: 'theme' | 'compactMode') =>
 `placementx:${userId ?? 'guest'}:${preference}`;

const readTheme = (userId?: string): Theme => {
 const storedTheme = localStorage.getItem(preferenceKey(userId, 'theme'));
 return isTheme(storedTheme) ? storedTheme : userId ? 'system' : 'light';
};

const readCompactMode = (userId?: string) =>
 localStorage.getItem(preferenceKey(userId, 'compactMode')) === 'true';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
 const userId = useAuthStore((state) => state.user?.id);
 const [theme, setThemeState] = useState<Theme>(() => readTheme(userId));
 const [compactMode, setCompactModeState] = useState<boolean>(() => readCompactMode(userId));

 // Every account owns its appearance. Signing out returns public/login pages to
 // their neutral light theme instead of exposing the previous user's preference.
 useEffect(() => {
 setThemeState(readTheme(userId));
 setCompactModeState(readCompactMode(userId));
 }, [userId]);

 useEffect(() => {
 const root = window.document.documentElement;

 // Handle compact mode
 if (compactMode) {
 root.classList.add('compact-mode');
 } else {
 root.classList.remove('compact-mode');
 }
 const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
 const applyTheme = () => {
 root.classList.remove('light', 'dark');
 root.classList.add(
 theme === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : theme
 );
 };

 applyTheme();
 mediaQuery.addEventListener('change', applyTheme);

 return () => mediaQuery.removeEventListener('change', applyTheme);
 }, [theme, compactMode]);

 const value = {
 theme,
 setTheme: (theme: Theme) => {
 localStorage.setItem(preferenceKey(userId, 'theme'), theme);
 setThemeState(theme);
 },
 compactMode,
 setCompactMode: (compact: boolean) => {
 localStorage.setItem(preferenceKey(userId, 'compactMode'), compact ? 'true' : 'false');
 setCompactModeState(compact);
 },
 };

 return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export const useTheme = () => {
 const context = useContext(ThemeProviderContext);
 if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
 return context;
};
