import { Modal, Platform, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

import { useApplyWallpaper } from './useApplyWallpaper';
import { useSaveAndShare } from './useSaveAndShare';

export type ApplySheetProps = {
  imageUrl: string;
  onDismiss: () => void;
  visible: boolean;
};

export function ApplySheet({ imageUrl, onDismiss, visible }: ApplySheetProps) {
  const theme = useTheme();
  const { applyWallpaper, error: applyError, isApplying } = useApplyWallpaper(imageUrl);
  const {
    activeAction,
    error: saveAndShareError,
    saveWallpaper,
    shareWallpaper,
  } = useSaveAndShare(imageUrl);
  const isAndroid = Platform.OS === 'android';
  const error = applyError ?? saveAndShareError;

  async function runAction(action: () => Promise<void>) {
    try {
      await action();
      onDismiss();
    } catch {
      // Hooks retain the user-facing error for the sheet.
    }
  }

  const buttonStyle = {
    alignItems: 'center' as const,
    backgroundColor: theme.accent,
    borderCurve: 'continuous' as const,
    borderRadius: 14,
    minHeight: 48,
    justifyContent: 'center' as const,
    paddingHorizontal: 16,
  };
  const disabled = isApplying || Boolean(activeAction);

  return (
    <Modal animationType="slide" onRequestClose={onDismiss} transparent visible={visible}>
      <View
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)', flex: 1, justifyContent: 'flex-end' }}
        testID="apply-sheet-backdrop"
      >
        <ThemedView
          variant="card"
          style={{
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            gap: 12,
            paddingBottom: 36,
          }}
        >
          <ThemedText variant="subtitle">应用壁纸</ThemedText>
          {isAndroid ? (
            <>
              <ThemedText style={{ color: theme.mutedText }} variant="caption">
                选择要更换的壁纸位置。
              </ThemedText>
              {(
                [
                  ['home', '设为桌面'],
                  ['lock', '设为锁屏'],
                  ['both', '设为桌面和锁屏'],
                ] as const
              ).map(([target, label]) => (
                <Pressable
                  accessibilityRole="button"
                  disabled={disabled}
                  key={target}
                  onPress={() => void runAction(() => applyWallpaper(target))}
                  style={[buttonStyle, disabled ? { opacity: 0.55 } : undefined]}
                  testID={`apply-wallpaper-${target}`}
                >
                  <ThemedText style={{ color: theme.surface }} variant="body">
                    {isApplying ? '正在应用…' : label}
                  </ThemedText>
                </Pressable>
              ))}
              <Pressable
                accessibilityRole="button"
                disabled={disabled}
                onPress={() => void runAction(shareWallpaper)}
                style={[buttonStyle, disabled ? { opacity: 0.55 } : undefined]}
                testID="share-wallpaper"
              >
                <ThemedText style={{ color: theme.surface }} variant="body">
                  {activeAction === 'share' ? '正在打开分享…' : '系统分享'}
                </ThemedText>
              </Pressable>
            </>
          ) : (
            <ThemedText style={{ color: theme.mutedText }} variant="caption">
              iOS 不支持由应用直接设置系统壁纸。保存后请在系统照片中设为壁纸。
            </ThemedText>
          )}
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            onPress={() => void runAction(saveWallpaper)}
            style={[buttonStyle, disabled ? { opacity: 0.55 } : undefined]}
            testID="save-wallpaper"
          >
            <ThemedText style={{ color: theme.surface }} variant="body">
              {activeAction === 'save' ? '正在保存…' : '存到相册'}
            </ThemedText>
          </Pressable>
          {error ? (
            <ThemedText style={{ color: theme.error }} testID="apply-sheet-error" variant="caption">
              {error.message}
            </ThemedText>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={onDismiss}
            style={{ alignItems: 'center', padding: 10 }}
          >
            <ThemedText style={{ color: theme.mutedText }} variant="body">
              取消
            </ThemedText>
          </Pressable>
        </ThemedView>
      </View>
    </Modal>
  );
}
