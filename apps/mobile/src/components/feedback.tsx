import { ActivityIndicator, type DimensionValue, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';

export function LoadingState({ label = '加载中…' }: { label?: string }) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: theme.muted,
        borderCurve: 'continuous',
        borderRadius: 10,
        flexDirection: 'row',
        gap: 10,
        padding: 12,
      }}
    >
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
    <View
      style={{
        backgroundColor: theme.muted,
        borderColor: theme.border,
        borderCurve: 'continuous',
        borderRadius: 10,
        borderWidth: 1,
        gap: 10,
        padding: 12,
      }}
    >
      <ThemedText selectable style={{ color: theme.error }} variant="caption">
        {message}
      </ThemedText>
      {onRetry ? (
        <Button icon="refresh" label="重试" onPress={onRetry} variant="secondary" />
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
    <View style={{ alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingVertical: 48 }}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: theme.muted,
          borderRadius: 999,
          height: 52,
          justifyContent: 'center',
          width: 52,
        }}
      >
        <AppIcon color={theme.mutedText} name="image" size={24} />
      </View>
      <ThemedText selectable variant="subtitle">
        {title}
      </ThemedText>
      <ThemedText selectable style={{ color: theme.mutedText, textAlign: 'center' }} variant="body">
        {description}
      </ThemedText>
      {onAction && actionLabel ? (
        <Button
          icon="sparkles"
          label={actionLabel}
          onPress={onAction}
          testID={actionTestId ?? 'empty-state-action'}
        />
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
        backgroundColor: theme.muted,
        borderCurve: 'continuous',
        borderRadius: 8,
        height,
        opacity: 0.65,
        width,
      }}
    />
  );
}
