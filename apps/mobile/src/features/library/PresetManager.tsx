import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

export function PresetManager() {
  const theme = useTheme();

  return (
    <ThemedView variant="card" style={{ gap: 8 }}>
      <View style={{ gap: 2 }}>
        <ThemedText variant="subtitle">自定义预设</ThemedText>
        <ThemedText style={{ color: theme.mutedText }} variant="caption">
          从喜欢的壁纸提取风格后，会在这里管理。
        </ThemedText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        disabled
        style={{ alignSelf: 'flex-start', opacity: 0.55 }}
        testID="preset-manager-placeholder"
      >
        <ThemedText style={{ color: theme.mutedText }} variant="body">
          暂无自定义预设
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}
