import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { GenerationMode } from '@/lib/api';

export type ExistingImageMode = Exclude<GenerationMode, 'text2img'>;

type EditModePickerProps = {
  onSelect: (mode: ExistingImageMode) => void;
  selectedMode?: ExistingImageMode;
};

const modes: Array<{ description: string; label: string; value: ExistingImageMode }> = [
  { description: '填满当前屏幕比例', label: '扩图', value: 'outpaint' },
  { description: '增强清晰度与细节', label: '优化', value: 'upscale' },
  { description: '按说明修改画面', label: '编辑', value: 'edit' },
  { description: '保存为创作预设', label: '提取风格', value: 'style' },
];

export function EditModePicker({ onSelect, selectedMode }: EditModePickerProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: 10 }}>
      <ThemedText variant="subtitle">选择处理方式</ThemedText>
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
