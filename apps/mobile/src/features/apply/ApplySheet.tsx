import { useLingui } from '@lingui/react/macro';
import { Modal, Platform, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';

import { useApplyWallpaper } from './useApplyWallpaper';
import { useSaveAndShare } from './useSaveAndShare';

export type ApplySheetProps = {
  imageUrl: string;
  onDismiss: () => void;
  visible: boolean;
};

export function ApplySheet({ imageUrl, onDismiss, visible }: ApplySheetProps) {
  const { t } = useLingui();
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

  const disabled = isApplying || Boolean(activeAction);

  return (
    <Modal animationType="slide" onRequestClose={onDismiss} transparent visible={visible}>
      <View
        style={{ backgroundColor: theme.overlay, flex: 1, justifyContent: 'flex-end' }}
        testID="apply-sheet-backdrop"
      >
        <ThemedView
          variant="card"
          style={{
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderLeftWidth: 0,
            borderRightWidth: 0,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            gap: 14,
            padding: 24,
            paddingBottom: 36,
          }}
        >
          <ThemedText variant="subtitle">
            {t({ id: 'mobile.apply.title', message: 'Apply wallpaper' })}
          </ThemedText>
          {isAndroid ? (
            <>
              <ThemedText style={{ color: theme.mutedText }} variant="caption">
                {t({ id: 'mobile.apply.chooseTarget', message: 'Choose where to apply it.' })}
              </ThemedText>
              {(
                [
                  ['home', t({ id: 'mobile.apply.home', message: 'Set as home screen' })],
                  ['lock', t({ id: 'mobile.apply.lock', message: 'Set as lock screen' })],
                  ['both', t({ id: 'mobile.apply.both', message: 'Set as both' })],
                ] as const
              ).map(([target, label]) => (
                <Button
                  disabled={disabled}
                  fullWidth
                  label={
                    isApplying ? t({ id: 'mobile.apply.applying', message: 'Applying…' }) : label
                  }
                  loading={isApplying}
                  key={target}
                  onPress={() => void runAction(() => applyWallpaper(target))}
                  testID={`apply-wallpaper-${target}`}
                  variant={target === 'both' ? 'primary' : 'secondary'}
                />
              ))}
              <Button
                disabled={disabled}
                fullWidth
                icon="share"
                label={
                  activeAction === 'share'
                    ? t({ id: 'mobile.apply.openingShare', message: 'Opening share…' })
                    : t({ id: 'mobile.apply.share', message: 'Share' })
                }
                loading={activeAction === 'share'}
                onPress={() => void runAction(shareWallpaper)}
                testID="share-wallpaper"
                variant="secondary"
              />
            </>
          ) : (
            <ThemedText style={{ color: theme.mutedText }} variant="caption">
              {t({
                id: 'mobile.apply.iosHint',
                message:
                  'iOS does not allow apps to set system wallpaper directly. Save it, then set it from Photos.',
              })}
            </ThemedText>
          )}
          <Button
            disabled={disabled}
            fullWidth
            icon="download"
            label={
              activeAction === 'save'
                ? t({ id: 'mobile.apply.saving', message: 'Saving…' })
                : t({ id: 'mobile.apply.save', message: 'Save to Photos' })
            }
            loading={activeAction === 'save'}
            onPress={() => void runAction(saveWallpaper)}
            testID="save-wallpaper"
            variant={isAndroid ? 'secondary' : 'primary'}
          />
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
              {t({ id: 'mobile.common.cancel', message: 'Cancel' })}
            </ThemedText>
          </Pressable>
        </ThemedView>
      </View>
    </Modal>
  );
}
