import { Pressable, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type StyleToPresetFormProps = {
  instruction: string;
  isSubmitting: boolean;
  onChangeInstruction: (instruction: string) => void;
  onSubmit: (instruction: string) => void;
};

export function StyleToPresetForm({
  instruction,
  isSubmitting,
  onChangeInstruction,
  onSubmit,
}: StyleToPresetFormProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: 10 }}>
      <ThemedText variant="subtitle">提取风格</ThemedText>
      <ThemedText style={{ color: theme.mutedText }} variant="caption">
        会分析色彩、构图和材质，并自动在创作页保存一个仅自己可见的预设。
      </ThemedText>
      <TextInput
        editable={!isSubmitting}
        onChangeText={onChangeInstruction}
        placeholder="可选：补充你希望保留的特点"
        placeholderTextColor={theme.mutedText}
        style={{
          borderColor: theme.border,
          borderCurve: 'continuous',
          borderRadius: 12,
          borderWidth: 1,
          color: theme.text,
          minHeight: 48,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
        testID="style-preset-instruction"
        value={instruction}
      />
      <Pressable
        accessibilityRole="button"
        disabled={isSubmitting}
        onPress={() => onSubmit(instruction || 'Extract a reusable wallpaper style from this image.')}
        style={{
          alignSelf: 'flex-start',
          backgroundColor: theme.accent,
          borderCurve: 'continuous',
          borderRadius: 14,
          opacity: isSubmitting ? 0.6 : 1,
          paddingHorizontal: 16,
          paddingVertical: 11,
        }}
        testID="extract-style-preset"
      >
        <ThemedText style={{ color: theme.surface }} variant="body">
          {isSubmitting ? '正在提取…' : '保存自定义预设'}
        </ThemedText>
      </Pressable>
    </View>
  );
}
