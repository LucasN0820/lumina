import { Platform } from 'react-native';

export const colors = {
  dark: {
    accent: '#8AB4FF',
    background: '#101114',
    border: '#303238',
    card: '#1A1B20',
    error: '#FFB4AB',
    mutedText: '#B6B8C0',
    surface: '#17181C',
    text: '#F4F5F7',
  },
  light: {
    accent: '#146CDB',
    background: '#F7F8FA',
    border: '#D9DDE5',
    card: '#FFFFFF',
    error: '#B42318',
    mutedText: '#60646C',
    surface: '#FFFFFF',
    text: '#1D1D20',
  },
} as const;

export const appFontFamily = Platform.select({
  android: 'sans-serif',
  default: 'system-ui',
  ios: 'System',
  web: 'system-ui',
});

export type AppTheme = (typeof colors)[keyof typeof colors] & { fontFamily: string };
