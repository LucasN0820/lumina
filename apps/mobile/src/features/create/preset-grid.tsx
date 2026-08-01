import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { ErrorState, LoadingState } from '@/components/feedback';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { getPresets } from '@/lib/api';

type PresetGridProps = {
  onSelect: (presetId: string) => void;
  selectedPresetId?: string;
};

export function PresetGrid({ onSelect, selectedPresetId }: PresetGridProps) {
  const presetsQuery = useQuery({ queryFn: getPresets, queryKey: ['presets'] });
  const theme = useTheme();

  return (
    <View style={{ gap: 10 }}>
      <ThemedText variant="subtitle">选择预设</ThemedText>
      {presetsQuery.isPending ? (
        <LoadingState label="正在加载预设…" />
      ) : presetsQuery.isError ? (
        <ErrorState
          message={presetsQuery.error.message}
          onRetry={() => void presetsQuery.refetch()}
        />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {presetsQuery.data.presets.map((preset) => {
            const selected = preset.id === selectedPresetId;

            return (
              <Pressable
                key={preset.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onSelect(preset.id)}
                style={{
                  backgroundColor: theme.card,
                  borderColor: selected ? theme.accent : theme.border,
                  borderCurve: 'continuous',
                  borderRadius: 12,
                  borderWidth: selected ? 2 : 1,
                  gap: 8,
                  overflow: 'hidden',
                  padding: 7,
                  width: '48%',
                }}
                testID={`preset-${preset.id}`}
              >
                {preset.coverImageUrl ? (
                  <Image
                    accessibilityLabel={`${preset.name} preset cover`}
                    contentFit="cover"
                    source={preset.coverImageUrl}
                    style={{ borderRadius: 8, height: 96, width: '100%' }}
                  />
                ) : null}
                <ThemedText numberOfLines={1} variant="body">
                  {preset.name}
                </ThemedText>
                <ThemedText style={{ color: theme.mutedText }} variant="caption">
                  {preset.category}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
