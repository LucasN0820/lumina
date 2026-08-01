import { Stack } from 'expo-router/stack';

import { useTheme } from '@/hooks/use-theme';
import { createTabStackScreenOptions } from '@/navigation/tab-stack-options';

export function TabStack({ title }: { title: string }) {
  const theme = useTheme();

  return (
    <Stack screenOptions={createTabStackScreenOptions(theme)}>
      <Stack.Screen name="index" options={{ title }} />
    </Stack>
  );
}
