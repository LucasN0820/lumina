import { useLingui } from '@lingui/react/macro';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { GenerationQuality } from '@/lib/api';

type QualitySelectorProps = {
  onChange: (quality: GenerationQuality) => void;
  value: GenerationQuality;
};

export function QualitySelector({ onChange, value }: QualitySelectorProps) {
  const { t } = useLingui();
  const theme = useTheme();
  const qualityOptions: Array<{
    description: string;
    label: string;
    value: GenerationQuality;
  }> = [
    {
      description: t({
        id: 'mobile.create.quality.draft.description',
        message: 'Faster and lower resolution, ideal for iterating on ideas',
      }),
      label: t({ id: 'mobile.create.quality.draft', message: 'Quick preview' }),
      value: 'draft',
    },
    {
      description: t({
        id: 'mobile.create.quality.hd.description',
        message: 'Full 2K+ resolution, ideal for saving and applying',
      }),
      label: t({ id: 'mobile.create.quality.hd', message: 'High resolution' }),
      value: 'hd',
    },
  ];

  return (
    <View style={{ gap: 8 }}>
      <ThemedText variant="subtitle">
        {t({ id: 'mobile.create.quality', message: 'Output quality' })}
      </ThemedText>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {qualityOptions.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={{
                backgroundColor: selected ? theme.accent : theme.surface,
                borderColor: selected ? theme.accent : theme.border,
                borderCurve: 'continuous',
                borderRadius: 11,
                borderWidth: 1,
                flex: 1,
                gap: 3,
                padding: 12,
              }}
              testID={`quality-${option.value}`}
            >
              <ThemedText
                style={{ color: selected ? theme.accentForeground : theme.text }}
                variant="body"
              >
                {option.label}
              </ThemedText>
              <ThemedText
                style={{ color: selected ? theme.accentForeground : theme.mutedText }}
                variant="caption"
              >
                {option.description}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
