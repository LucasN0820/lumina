import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { GenerationUserInputs } from '@/lib/api';

export type CreateChipField = 'mood' | 'theme' | 'tone';
export type CreateChipValues = Pick<GenerationUserInputs, CreateChipField>;

type ChipsSelectorProps = {
  onChange: (field: CreateChipField, value: string | undefined) => void;
  values: CreateChipValues;
};

const chipGroups: Array<{ field: CreateChipField; label: string; options: string[] }> = [
  { field: 'theme', label: '主题', options: ['自然', '城市', '宇宙', '抽象'] },
  { field: 'tone', label: '色调', options: ['暖色', '冷色', '柔和', '高对比'] },
  { field: 'mood', label: '氛围', options: ['平静', '神秘', '活力', '梦幻'] },
];

export function ChipsSelector({ onChange, values }: ChipsSelectorProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: 14 }}>
      {chipGroups.map(({ field, label, options }) => (
        <View key={field} style={{ gap: 8 }}>
          <ThemedText variant="subtitle">{label}</ThemedText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {options.map((option) => {
              const selected = values[field] === option;

              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => onChange(field, selected ? undefined : option)}
                  style={{
                    backgroundColor: selected ? theme.accent : theme.surface,
                    borderColor: selected ? theme.accent : theme.border,
                    borderCurve: 'continuous',
                    borderRadius: 9,
                    borderWidth: 1,
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                  }}
                  testID={`chip-${field}-${option}`}
                >
                  <ThemedText
                    style={{ color: selected ? theme.accentForeground : theme.text }}
                    variant="caption"
                  >
                    {option}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
