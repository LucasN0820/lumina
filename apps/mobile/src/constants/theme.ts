import { Platform } from 'react-native';

export const colors = {
  dark: {
    accent: '#F4F4F5',
    accentForeground: '#18181B',
    background: '#09090B',
    border: '#27272A',
    card: '#111113',
    error: '#FDA4AF',
    muted: '#18181B',
    mutedText: '#A1A1AA',
    overlay: 'rgba(0, 0, 0, 0.72)',
    ring: '#71717A',
    surface: '#111113',
    text: '#FAFAFA',
  },
  light: {
    accent: '#18181B',
    accentForeground: '#FAFAFA',
    background: '#F7F7F5',
    border: '#E4E4E7',
    card: '#FFFFFF',
    error: '#BE123C',
    muted: '#F1F1EF',
    mutedText: '#71717A',
    overlay: 'rgba(9, 9, 11, 0.48)',
    ring: '#A1A1AA',
    surface: '#FCFCFB',
    text: '#18181B',
  },
} as const;

export const appFontFamily = Platform.select({
  android: 'sans-serif',
  default: 'system-ui',
  ios: 'System',
  web: 'system-ui',
});

export type AppTheme = (typeof colors)[keyof typeof colors] & { fontFamily: string };
