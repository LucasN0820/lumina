import { ActivityIndicator, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type GenerateButtonProps = {
  disabled: boolean;
  isGenerating: boolean;
  onPress: () => void;
};

export function GenerateButton({ disabled, isGenerating, onPress }: GenerateButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        alignItems: 'center',
        backgroundColor: disabled ? theme.border : theme.accent,
        borderCurve: 'continuous',
        borderRadius: 18,
        justifyContent: 'center',
        minHeight: 54,
        paddingHorizontal: 20,
      }}
      testID="generate-button"
    >
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
        {isGenerating ? <ActivityIndicator color={theme.surface} /> : null}
        <ThemedText style={{ color: theme.surface, fontWeight: '700' }} variant="body">
          {isGenerating ? '正在生成…' : '生成壁纸'}
        </ThemedText>
      </View>
    </Pressable>
  );
}
