import { useLingui } from '@lingui/react/macro';
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

export function ChipsSelector({ onChange, values }: ChipsSelectorProps) {
  const { t } = useLingui();
  const theme = useTheme();
  const chipGroups: Array<{
    field: CreateChipField;
    label: string;
    options: Array<{ label: string; value: string }>;
  }> = [
    {
      field: 'theme',
      label: t({ id: 'mobile.create.theme', message: 'Theme' }),
      options: [
        { label: t({ id: 'mobile.create.theme.nature', message: 'Nature' }), value: 'nature' },
        { label: t({ id: 'mobile.create.theme.city', message: 'City' }), value: 'city' },
        { label: t({ id: 'mobile.create.theme.space', message: 'Space' }), value: 'space' },
        {
          label: t({ id: 'mobile.create.theme.abstract', message: 'Abstract' }),
          value: 'abstract',
        },
      ],
    },
    {
      field: 'tone',
      label: t({ id: 'mobile.create.tone', message: 'Color tone' }),
      options: [
        { label: t({ id: 'mobile.create.tone.warm', message: 'Warm' }), value: 'warm' },
        { label: t({ id: 'mobile.create.tone.cool', message: 'Cool' }), value: 'cool' },
        { label: t({ id: 'mobile.create.tone.soft', message: 'Soft' }), value: 'soft' },
        {
          label: t({ id: 'mobile.create.tone.highContrast', message: 'High contrast' }),
          value: 'high-contrast',
        },
      ],
    },
    {
      field: 'mood',
      label: t({ id: 'mobile.create.mood', message: 'Mood' }),
      options: [
        { label: t({ id: 'mobile.create.mood.calm', message: 'Calm' }), value: 'calm' },
        {
          label: t({ id: 'mobile.create.mood.mysterious', message: 'Mysterious' }),
          value: 'mysterious',
        },
        {
          label: t({ id: 'mobile.create.mood.energetic', message: 'Energetic' }),
          value: 'energetic',
        },
        { label: t({ id: 'mobile.create.mood.dreamy', message: 'Dreamy' }), value: 'dreamy' },
      ],
    },
  ];

  return (
    <View style={{ gap: 14 }}>
      {chipGroups.map(({ field, label, options }) => (
        <View key={field} style={{ gap: 8 }}>
          <ThemedText variant="subtitle">{label}</ThemedText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {options.map((option) => {
              const selected = values[field] === option.value;

              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => onChange(field, selected ? undefined : option.value)}
                  style={{
                    backgroundColor: selected ? theme.accent : theme.surface,
                    borderColor: selected ? theme.accent : theme.border,
                    borderCurve: 'continuous',
                    borderRadius: 9,
                    borderWidth: 1,
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                  }}
                  testID={`chip-${field}-${option.value}`}
                >
                  <ThemedText
                    style={{ color: selected ? theme.accentForeground : theme.text }}
                    variant="caption"
                  >
                    {option.label}
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
