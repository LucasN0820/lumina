import { Pressable, Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type GoogleSignInButtonProps = {
  isLoading?: boolean;
  onPress: () => void;
};

export function GoogleSignInButton({ isLoading = false, onPress }: GoogleSignInButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isLoading}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        backgroundColor: theme.text,
        borderCurve: 'continuous',
        borderRadius: 14,
        justifyContent: 'center',
        minHeight: 52,
        opacity: pressed || isLoading ? 0.72 : 1,
        paddingHorizontal: 20,
      })}
    >
      <Text style={{ color: theme.surface, fontSize: 16, fontWeight: '700' }}>
        {isLoading ? '正在打开 Google…' : '使用 Google 登录'}
      </Text>
    </Pressable>
  );
}
