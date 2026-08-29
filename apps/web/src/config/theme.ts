/**
 * ============================================
 * PlacementX — Design Tokens
 * ============================================
 *
 * Centralized design token constants for use in
 * JS/TS logic (e.g., charts, canvas, React Native
 * or inline styles where Tailwind classes cannot be used).
 */

export const colors = {
  brand: {
    maroon: '#8B0000',
    red: '#9B1B1B',
    navy: '#1C3D58',
    charcoal: '#2B2B2B',
    gold: '#F5C518',
  },
  base: {
    background: '#EFEFEF',
    foreground: '#1A1A1A',
    card: '#FFFFFF',
    cardForeground: '#1A1A1A',
    popover: '#FFFFFF',
    popoverForeground: '#1A1A1A',
    primary: '#8B0000',
    primaryForeground: '#FFFFFF',
    secondary: '#1C3D58',
    secondaryForeground: '#FFFFFF',
    muted: '#DCDCDC',
    mutedForeground: '#555555',
    accent: '#F5C518',
    accentForeground: '#1A1A1A',
    destructive: '#DC3545',
    destructiveForeground: '#FFFFFF',
    border: '#DCDCDC',
    input: '#DCDCDC',
    ring: '#1C3D58',
  },
  status: {
    success: '#28A745',
    successForeground: '#FFFFFF',
    warning: '#FD7E14',
    warningForeground: '#1A1A1A',
    info: '#007BFF',
    infoForeground: '#FFFFFF',
  },
} as const;

export const typography = {
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
  },
  sizes: {
    display: '3.5rem',
    heading: '2.5rem',
    title: '1.75rem',
    subtitle: '1.25rem',
    body: '1rem',
    caption: '0.875rem',
    label: '0.75rem',
    button: '0.875rem',
  },
} as const;

export const spacing = {
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
  card: '0 2px 8px rgba(0, 0, 0, 0.04)',
  dropdown: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
  modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const;

export const borders = {
  radius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
} as const;
