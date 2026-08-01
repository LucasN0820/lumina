import { ActivityIndicator, Pressable, Text, View } from 'react-native';

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
        backgroundColor: theme.card,
        borderColor: theme.border,
        borderCurve: 'continuous',
        borderRadius: 11,
        borderWidth: 1,
        justifyContent: 'center',
        minHeight: 48,
        opacity: pressed || isLoading ? 0.72 : 1,
        paddingHorizontal: 20,
      })}
    >
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
        {isLoading ? (
          <ActivityIndicator color={theme.text} size="small" />
        ) : (
          <View
            style={{
              alignItems: 'center',
              borderColor: theme.border,
              borderRadius: 999,
              borderWidth: 1,
              height: 24,
              justifyContent: 'center',
              width: 24,
            }}
          >
            <Text style={{ color: theme.text, fontSize: 13, fontWeight: '700' }}>G</Text>
          </View>
        )}
        <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>
          {isLoading ? '正在打开 Google…' : '使用 Google 登录'}
        </Text>
      </View>
    </Pressable>
  );
}
