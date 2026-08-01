import { ClerkProvider } from '@clerk/expo';
import { QueryClientProvider } from '@tanstack/react-query';
import { Host } from '@expo/ui';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, useColorScheme, View } from 'react-native';

import { ApiTokenBridge } from '@/features/auth/ApiTokenBridge';
import { MobileI18nProvider } from '@/features/i18n/i18n-provider';
import { clerkTokenCache } from '@/lib/clerkTokenCache';
import { queryClient } from '@/lib/queryClient';
import { useTheme } from '@/hooks/use-theme';

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
    return (
      <View
        style={{
          alignItems: 'center',
          backgroundColor: appTheme.background,
          flex: 1,
          gap: 8,
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Text style={{ color: appTheme.text, fontSize: 18, fontWeight: '600' }}>
          Lumina 配置不完整
        </Text>
        <Text selectable style={{ color: appTheme.mutedText, textAlign: 'center' }}>
          请配置 EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY 后重新启动应用。
        </Text>
      </View>
    );
  }

  return (
    <MobileI18nProvider>
      <ClerkProvider publishableKey={publishableKey} tokenCache={clerkTokenCache}>
        <ApiTokenBridge />
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={navigationTheme}>
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
