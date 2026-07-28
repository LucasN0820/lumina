import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { GenerationQuality } from '@/lib/api';

type QualitySelectorProps = {
  onChange: (quality: GenerationQuality) => void;
  value: GenerationQuality;
};

const qualityOptions: Array<{ description: string; label: string; value: GenerationQuality }> = [
  { description: '更快、低分辨率，适合迭代想法', label: '快速预览', value: 'draft' },
  { description: '2K+ 全分辨率，适合保存和应用', label: '高清出图', value: 'hd' },
];

export function QualitySelector({ onChange, value }: QualitySelectorProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: 8 }}>
      <ThemedText variant="subtitle">出图质量</ThemedText>
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
                borderRadius: 14,
                borderWidth: 1,
                flex: 1,
                gap: 3,
                padding: 12,
              }}
              testID={`quality-${option.value}`}
            >
              <ThemedText style={{ color: selected ? theme.surface : theme.text }} variant="body">
                {option.label}
              </ThemedText>
              <ThemedText
                style={{ color: selected ? theme.surface : theme.mutedText }}
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
