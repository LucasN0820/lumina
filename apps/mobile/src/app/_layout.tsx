import { ClerkProvider } from '@clerk/expo';
import { Host } from '@expo/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { ApiTokenBridge } from '@/features/auth/ApiTokenBridge';
import { MobileI18nProvider } from '@/features/i18n/i18n-provider';
import { useTheme } from '@/hooks/use-theme';
import { clerkTokenCache } from '@/lib/clerkTokenCache';
import { queryClient } from '@/lib/queryClient';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const appTheme = useTheme();
  const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: appTheme.background,
      border: appTheme.border,
      card: appTheme.surface,
      notification: appTheme.error,
      primary: appTheme.text,
      text: appTheme.text,
    },
  };

  if (!publishableKey) {
    throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable');
  }

  return (
    <MobileI18nProvider>
      <ClerkProvider publishableKey={publishableKey} tokenCache={clerkTokenCache}>
        <ApiTokenBridge />
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={navigationTheme}>
            <Host colorScheme={colorScheme} style={{ flex: 1 }}>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <SafeAreaProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                </Stack>
              </SafeAreaProvider>
            </Host>
          </ThemeProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </MobileI18nProvider>
  );
}
