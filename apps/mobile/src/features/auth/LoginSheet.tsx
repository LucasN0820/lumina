import { Modal, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

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
  return (
    <Modal animationType="slide" onRequestClose={onDismiss} transparent visible={visible}>
      <View
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          flex: 1,
          justifyContent: 'flex-end',
          padding: 16,
        }}
      >
        <ThemedView
          variant="card"
          style={{ borderBottomLeftRadius: 28, borderBottomRightRadius: 28, gap: 16 }}
        >
          <ThemedText variant="subtitle">登录以同步你的壁纸</ThemedText>
          <ThemedText variant="body">
            登录后会保留此设备已有的生成历史，并可在新设备上继续使用。
          </ThemedText>
          {error ? (
            <ThemedText style={{ color: '#D83030' }} variant="caption">
              {error.message}
            </ThemedText>
          ) : null}
          <GoogleSignInButton isLoading={isLoading} onPress={onGoogleSignIn} />
          <Pressable accessibilityRole="button" onPress={onDismiss} style={{ alignSelf: 'center' }}>
            <ThemedText variant="caption">暂不登录</ThemedText>
          </Pressable>
        </ThemedView>
      </View>
    </Modal>
  );
}
