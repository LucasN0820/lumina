import { useLingui } from '@lingui/react/macro';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

export function PresetManager() {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <ThemedView variant="card" style={{ gap: 8 }}>
      <View style={{ gap: 2 }}>
        <ThemedText variant="subtitle">
          {t({ id: 'mobile.library.customPresets', message: 'Custom presets' })}
        </ThemedText>
        <ThemedText style={{ color: theme.mutedText }} variant="caption">
          {t({
            id: 'mobile.library.customPresets.description',
            message: 'Styles extracted from your favorite wallpapers will appear here.',
          })}
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
          {t({ id: 'mobile.library.customPresets.empty', message: 'No custom presets yet' })}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}
