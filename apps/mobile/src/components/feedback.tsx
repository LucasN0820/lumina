import { ActivityIndicator, Pressable, type DimensionValue, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function LoadingState({ label = '加载中…' }: { label?: string }) {
  const theme = useTheme();

  return (
    <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
      <ActivityIndicator color={theme.accent} />
      <ThemedText selectable variant="body">
        {label}
      </ThemedText>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const theme = useTheme();

  return (
    <View style={{ gap: 8 }}>
      <ThemedText selectable style={{ color: theme.error }} variant="body">
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

export function EmptyState({
  actionLabel,
  actionTestId,
  description,
  onAction,
  title,
}: {
  actionLabel?: string;
  actionTestId?: string;
  description: string;
  onAction?: () => void;
  title: string;
}) {
  const theme = useTheme();

  return (
    <View style={{ alignItems: 'center', gap: 10, paddingVertical: 32 }}>
      <ThemedText selectable variant="subtitle">
        {title}
      </ThemedText>
      <ThemedText selectable style={{ color: theme.mutedText, textAlign: 'center' }} variant="body">
        {description}
      </ThemedText>
      {onAction && actionLabel ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          testID={actionTestId ?? 'empty-state-action'}
        >
          <ThemedText style={{ color: theme.accent }} variant="body">
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Skeleton({
  height = 16,
  width = '100%',
}: {
  height?: number;
  width?: DimensionValue;
}) {
  const theme = useTheme();

  return (
    <View
      accessibilityLabel="加载占位"
      style={{
        backgroundColor: theme.border,
        borderCurve: 'continuous',
        borderRadius: 8,
        height,
        opacity: 0.65,
        width,
      }}
    />
  );
}
