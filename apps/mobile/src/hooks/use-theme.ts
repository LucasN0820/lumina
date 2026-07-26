import { useColorScheme } from 'react-native';

import { appFontFamily, colors, type AppTheme } from '@/constants/theme';

export function useTheme(): AppTheme {
  const colorScheme = useColorScheme();
  const palette = colorScheme === 'dark' ? colors.dark : colors.light;

  return { ...palette, fontFamily: appFontFamily };
}
