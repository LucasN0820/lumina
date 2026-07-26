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
      <ThemedText variant="subtitle">一句话灵感</ThemedText>
      <TextInput
        accessibilityLabel="Wallpaper idea"
        maxLength={1_000}
        onChangeText={onChangeText}
        placeholder="例如：雨夜的霓虹城市"
        placeholderTextColor={theme.mutedText}
        returnKeyType="done"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderCurve: 'continuous',
          borderRadius: 16,
          borderWidth: 1,
          color: theme.text,
          fontFamily: theme.fontFamily,
          fontSize: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
        }}
        value={value}
      />
      <ThemedText style={{ color: theme.mutedText }} variant="caption">
        {value.length}/1000
      </ThemedText>
    </View>
  );
}
