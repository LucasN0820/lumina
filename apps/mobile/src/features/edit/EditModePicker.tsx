import { useLingui } from '@lingui/react/macro';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { GenerationMode } from '@/lib/api';

export type ExistingImageMode = Exclude<GenerationMode, 'text2img'>;

type EditModePickerProps = {
  onSelect: (mode: ExistingImageMode) => void;
  selectedMode?: ExistingImageMode;
};

export function EditModePicker({ onSelect, selectedMode }: EditModePickerProps) {
  const { t } = useLingui();
  const theme = useTheme();
  const modes: Array<{ description: string; label: string; value: ExistingImageMode }> = [
    {
      description: t({ id: 'mobile.edit.mode.outpaint.description', message: 'Fill your screen' }),
      label: t({ id: 'mobile.edit.mode.outpaint', message: 'Extend' }),
      value: 'outpaint',
    },
    {
      description: t({
        id: 'mobile.edit.mode.upscale.description',
        message: 'Enhance clarity and detail',
      }),
      label: t({ id: 'mobile.edit.mode.upscale', message: 'Enhance' }),
      value: 'upscale',
    },
    {
      description: t({ id: 'mobile.edit.mode.edit.description', message: 'Change with a prompt' }),
      label: t({ id: 'mobile.edit.mode.edit', message: 'Edit' }),
      value: 'edit',
    },
    {
      description: t({
        id: 'mobile.edit.mode.style.description',
        message: 'Save as a creative preset',
      }),
      label: t({ id: 'mobile.edit.mode.style', message: 'Extract style' }),
      value: 'style',
    },
  ];

  return (
    <View style={{ gap: 10 }}>
      <ThemedText variant="subtitle">
        {t({ id: 'mobile.edit.chooseMode', message: 'Choose an action' })}
      </ThemedText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {modes.map((mode) => {
          const selected = selectedMode === mode.value;
          return (
            <Pressable
              key={mode.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onSelect(mode.value)}
              style={{
                backgroundColor: selected ? theme.accent : theme.surface,
                borderColor: selected ? theme.accent : theme.border,
                borderCurve: 'continuous',
                borderRadius: 11,
                borderWidth: 1,
                gap: 2,
                padding: 12,
                width: '47%',
              }}
              testID={`edit-mode-${mode.value}`}
            >
              <ThemedText
                style={{ color: selected ? theme.accentForeground : theme.text }}
                variant="body"
              >
                {mode.label}
              </ThemedText>
              <ThemedText
                style={{ color: selected ? theme.accentForeground : theme.mutedText }}
                variant="caption"
              >
                {mode.description}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
