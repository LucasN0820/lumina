import { ClerkProvider } from '@clerk/expo';
import { QueryClientProvider } from '@tanstack/react-query';
import { Host } from '@expo/ui';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { ApiTokenBridge } from '@/features/auth/ApiTokenBridge';
import { MobileI18nProvider } from '@/features/i18n/i18n-provider';
import { clerkTokenCache } from '@/lib/clerkTokenCache';
import { queryClient } from '@/lib/queryClient';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
  if (!publishableKey) {
    throw new Error('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is required to initialize Clerk.');
  }

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <MobileI18nProvider>
      <ClerkProvider publishableKey={publishableKey} tokenCache={clerkTokenCache}>
        <ApiTokenBridge />
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={theme}>
            <Host colorScheme={colorScheme} style={{ flex: 1 }}>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
              </Stack>
            </Host>
          </ThemeProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </MobileI18nProvider>
  );
}
