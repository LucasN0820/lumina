import { TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type IdeaInputProps = {
  onChangeText: (value: string) => void;
  value: string;
};

export function IdeaInput({ onChangeText, value }: IdeaInputProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: 8 }}>
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <ThemedText variant="subtitle">一句话灵感</ThemedText>
        <ThemedText
          style={{ color: theme.mutedText, fontVariant: ['tabular-nums'] }}
          variant="caption"
        >
          {value.length}/1000
        </ThemedText>
      </View>
      <TextInput
        accessibilityLabel="Wallpaper idea"
        maxLength={1_000}
        onChangeText={onChangeText}
        placeholder="例如：雨夜的霓虹城市"
        placeholderTextColor={theme.mutedText}
        multiline
        returnKeyType="default"
        textAlignVertical="top"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderCurve: 'continuous',
          borderRadius: 11,
          borderWidth: 1,
          color: theme.text,
          fontFamily: theme.fontFamily,
          fontSize: 16,
          lineHeight: 23,
          minHeight: 108,
          paddingHorizontal: 16,
          paddingVertical: 14,
        }}
        value={value}
      />
    </View>
  );
}
