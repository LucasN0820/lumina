import { useLingui } from '@lingui/react/macro';
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
  const { t } = useLingui();
  const presetsQuery = useQuery({ queryFn: getPresets, queryKey: ['presets'] });
  const theme = useTheme();
  const builtInPresetCopy: Partial<Record<string, { category: string; name: string }>> = {
    preset_builtin_abstract: {
      category: t({
        id: 'mobile.create.preset.abstract.category',
        message: 'Abstract art',
      }),
      name: t({ id: 'mobile.create.preset.abstract.name', message: 'Abstract' }),
    },
    preset_builtin_anime: {
      category: t({ id: 'mobile.create.preset.anime.category', message: 'Anime art' }),
      name: t({ id: 'mobile.create.preset.anime.name', message: 'Anime' }),
    },
    preset_builtin_cinematic: {
      category: t({
        id: 'mobile.create.preset.cinematic.category',
        message: 'Cinematic art',
      }),
      name: t({ id: 'mobile.create.preset.cinematic.name', message: 'Cinematic' }),
    },
    preset_builtin_cyberpunk: {
      category: t({
        id: 'mobile.create.preset.cyberpunk.category',
        message: 'Cyberpunk art',
      }),
      name: t({ id: 'mobile.create.preset.cyberpunk.name', message: 'Cyberpunk' }),
    },
    preset_builtin_editorial: {
      category: t({
        id: 'mobile.create.preset.editorial.category',
        message: 'Editorial art',
      }),
      name: t({ id: 'mobile.create.preset.editorial.name', message: 'Editorial' }),
    },
    preset_builtin_minimal: {
      category: t({ id: 'mobile.create.preset.minimal.category', message: 'Minimal art' }),
      name: t({ id: 'mobile.create.preset.minimal.name', message: 'Minimal' }),
    },
    preset_builtin_nature: {
      category: t({ id: 'mobile.create.preset.nature.category', message: 'Nature art' }),
      name: t({ id: 'mobile.create.preset.nature.name', message: 'Nature' }),
    },
  };

  return (
    <View style={{ gap: 10 }}>
      <ThemedText variant="subtitle">
        {t({ id: 'mobile.create.selectPreset', message: 'Choose a preset' })}
      </ThemedText>
      {presetsQuery.isPending ? (
        <LoadingState
          label={t({ id: 'mobile.create.loadingPresets', message: 'Loading presets…' })}
        />
      ) : presetsQuery.isError ? (
        <ErrorState
          message={presetsQuery.error.message}
          onRetry={() => void presetsQuery.refetch()}
        />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {presetsQuery.data.presets.map((preset) => {
            const copy = builtInPresetCopy[preset.id];
            const category = copy?.category ?? preset.category;
            const name = copy?.name ?? preset.name;
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
                    accessibilityLabel={t({
                      id: 'mobile.create.presetCover',
                      message: `${name} preset cover`,
                    })}
                    contentFit="cover"
                    source={preset.coverImageUrl}
                    style={{ borderRadius: 8, height: 96, width: '100%' }}
                  />
                ) : null}
                <ThemedText numberOfLines={1} variant="body">
                  {name}
                </ThemedText>
                <ThemedText style={{ color: theme.mutedText }} variant="caption">
                  {category}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
