import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderState {
 theme: Theme;
 setTheme: (theme: Theme) => void;
 compactMode: boolean;
 setCompactMode: (compact: boolean) => void;
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
 const [theme, setTheme] = useState<Theme>(
 () => (localStorage.getItem('theme') as Theme) || 'system'
 );

 const [compactMode, setCompactMode] = useState<boolean>(
 () => localStorage.getItem('compactMode') === 'true'
 );

 useEffect(() => {
 const root = window.document.documentElement;

 // Handle theme
 root.classList.remove('light', 'dark');
 if (theme === 'system') {
 const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
 ? 'dark'
 : 'light';
 root.classList.add(systemTheme);
 } else {
 root.classList.add(theme);
 }

 // Handle compact mode
 if (compactMode) {
 root.classList.add('compact-mode');
 } else {
 root.classList.remove('compact-mode');
 }
 }, [theme, compactMode]);

 const value = {
 theme,
 setTheme: (theme: Theme) => {
 localStorage.setItem('theme', theme);
 setTheme(theme);
 },
 compactMode,
 setCompactMode: (compact: boolean) => {
 localStorage.setItem('compactMode', compact ? 'true' : 'false');
 setCompactMode(compact);
 },
 };

 return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export const useTheme = () => {
 const context = useContext(ThemeProviderContext);
 if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
 return context;
};
