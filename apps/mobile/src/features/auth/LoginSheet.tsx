import { Modal, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

import { GoogleSignInButton } from './GoogleSignInButton';

export type LoginSheetProps = {
  error?: Error;
  isLoading?: boolean;
  onDismiss: () => void;
  onGoogleSignIn: () => void;
  visible: boolean;
};

export function LoginSheet({
  error,
  isLoading = false,
  onDismiss,
  onGoogleSignIn,
  visible,
}: LoginSheetProps) {
  const theme = useTheme();

  return (
    <Modal
      animationType="slide"
      onRequestClose={onDismiss}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View
        style={{
          backgroundColor: theme.overlay,
          flex: 1,
          justifyContent: 'flex-end',
        }}
      >
        <Pressable accessibilityLabel="关闭登录窗口" onPress={onDismiss} style={{ flex: 1 }} />
        <ThemedView
          variant="card"
          style={{
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderLeftWidth: 0,
            borderRightWidth: 0,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            gap: 18,
            padding: 24,
            paddingBottom: 36,
          }}
        >
          <View style={{ gap: 6 }}>
            <ThemedText variant="title">连接你的创作空间</ThemedText>
            <ThemedText style={{ color: theme.mutedText }} variant="body">
              使用 Google 登录后，此设备的生成历史会安全合并到你的账号。
            </ThemedText>
          </View>
          {error ? (
            <ThemedText style={{ color: theme.error }} variant="caption">
              {error.message}
            </ThemedText>
          ) : null}
          <GoogleSignInButton isLoading={isLoading} onPress={onGoogleSignIn} />
          <Pressable accessibilityRole="button" onPress={onDismiss} style={{ alignSelf: 'center' }}>
            <ThemedText style={{ color: theme.mutedText }} variant="caption">
              暂不登录
            </ThemedText>
          </Pressable>
        </ThemedView>
      </View>
    </Modal>
  );
}
