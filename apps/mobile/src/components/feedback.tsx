import { ActivityIndicator, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function LoadingState({ label = '加载中…' }: { label?: string }) {
  const theme = useTheme();

  return (
    <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
      <ActivityIndicator color={theme.accent} />
      <ThemedText variant="body">{label}</ThemedText>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const theme = useTheme();

  return (
    <View style={{ gap: 8 }}>
      <ThemedText style={{ color: theme.error }} variant="body">
        {message}
      </ThemedText>
      {onRetry ? (
        <Pressable accessibilityRole="button" onPress={onRetry} style={{ alignSelf: 'flex-start' }}>
          <ThemedText style={{ color: theme.accent }} variant="body">
            重试
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}
