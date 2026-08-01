import { useLingui } from '@lingui/react/macro';
import { TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type IdeaInputProps = {
  onChangeText: (value: string) => void;
  value: string;
};

export function IdeaInput({ onChangeText, value }: IdeaInputProps) {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <View style={{ gap: 8 }}>
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <ThemedText variant="subtitle">
          {t({ id: 'mobile.create.idea', message: 'Describe your idea' })}
        </ThemedText>
        <ThemedText
          style={{ color: theme.mutedText, fontVariant: ['tabular-nums'] }}
          variant="caption"
        >
          {value.length}/1000
        </ThemedText>
      </View>
      <TextInput
        accessibilityLabel={t({
          id: 'mobile.create.idea.accessibility',
          message: 'Wallpaper idea',
        })}
        maxLength={1_000}
        onChangeText={onChangeText}
        placeholder={t({
          id: 'mobile.create.idea.placeholder',
          message: 'For example: a neon city on a rainy night',
        })}
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
