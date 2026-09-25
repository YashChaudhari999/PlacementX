import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedThemeMode = 'light' | 'dark';

const brand = { maroon: '#7A1027', maroonStrong: '#5B0B1C', navy: '#17324D', gold: '#C9972B', teal: '#147D74' } as const;
const shared = {
  brand,
  spacing: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 } as const,
  radius: { none: 0, sm: 6, md: 10, lg: 14, xl: 18, '2xl': 24, full: 9999 } as const,
  typography: {
    display: { fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }), fontSize: 34, lineHeight: 40, fontWeight: '700' as const, letterSpacing: -0.6 },
    h1: { fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }), fontSize: 28, lineHeight: 34, fontWeight: '700' as const, letterSpacing: -0.35 },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const, letterSpacing: -0.2 },
    h3: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
    bodyLarge: { fontSize: 17, lineHeight: 25, fontWeight: '400' as const },
    body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
    bodySmall: { fontSize: 13, lineHeight: 19, fontWeight: '400' as const },
    label: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
    button: { fontSize: 15, lineHeight: 20, fontWeight: '700' as const },
  },
  motion: { instant: 0, fast: 140, standard: 220, deliberate: 320 } as const,
  breakpoints: { compact: 360, tablet: 768, wide: 1024 } as const,
} as const;

const lightColors = {
  ...brand, background: '#F7F4EF', surface: '#FFFFFF', surfaceSecondary: '#EFE9E1', foreground: '#1E252B', foregroundMuted: '#67717B',
  primary: brand.maroon, primaryForeground: '#FFFFFF', secondary: brand.navy, secondaryForeground: '#FFFFFF', success: '#247A52',
  warning: '#A86512', destructive: '#B4232D', info: '#246B91', border: '#DDD5CB', divider: '#E9E2D9', focus: '#2E78A3', overlay: 'rgba(21, 29, 36, 0.48)',
} as const;
const darkColors = {
  ...brand, background: '#12171C', surface: '#1A2128', surfaceSecondary: '#232C34', foreground: '#F5F1EB', foregroundMuted: '#AEB7BF',
  primary: '#D890A1', primaryForeground: '#2C0711', secondary: '#8FB2D0', secondaryForeground: '#0D2232', success: '#6FC39A',
  warning: '#E4B35E', destructive: '#F08B91', info: '#78B9DA', border: '#35414B', divider: '#2B353E', focus: '#8CC8E8', overlay: 'rgba(0, 0, 0, 0.66)',
} as const;
const elevations = {
  none: {},
  subtle: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
  raised: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  overlay: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.16, shadowRadius: 24, elevation: 8 },
} as const;

export const createTheme = (mode: ResolvedThemeMode) => {
  const colors = mode === 'dark' ? darkColors : lightColors;
  return {
    ...shared, mode,
    colors: {
      ...colors, card: colors.surface, cardForeground: colors.foreground, muted: colors.surfaceSecondary, mutedForeground: colors.foregroundMuted,
      accent: brand.gold, accentForeground: mode === 'dark' ? '#211705' : '#2B210B', destructiveForeground: mode === 'dark' ? '#2B080B' : '#FFFFFF',
      input: colors.border, error: colors.destructive,
    },
    elevation: elevations,
    shadows: { sm: elevations.subtle, md: elevations.raised, card: elevations.raised },
  };
};

export type AppTheme = ReturnType<typeof createTheme>;
export const theme = createTheme('light');
