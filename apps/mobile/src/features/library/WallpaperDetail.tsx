import { useLingui } from '@lingui/react/macro';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';

import { WallpaperPreview, type WallpaperPreviewMode } from '@/components/WallpaperPreview';
import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { useTheme } from '@/hooks/use-theme';
import type { WallpaperListItem } from '@/lib/api';

type WallpaperDetailProps = {
  actionSlot?: ReactNode;
  onClose: () => void;
  onModeChange: (mode: WallpaperPreviewMode) => void;
  previewMode: WallpaperPreviewMode;
  wallpaper: WallpaperListItem;
};

export function WallpaperDetail({
  actionSlot,
  onClose,
  onModeChange,
  previewMode,
  wallpaper,
}: WallpaperDetailProps) {
  const { t } = useLingui();
  const { width: windowWidth } = useWindowDimensions();
  const theme = useTheme();
  const previewWidth = Math.max(180, Math.min(windowWidth - 48, 320));
  const ratio = wallpaper.width && wallpaper.height ? wallpaper.height / wallpaper.width : 16 / 9;
  const previewHeight = Math.round(previewWidth * ratio);
  const modeLabels: Record<string, string> = {
    edit: t({ id: 'mobile.library.mode.edit', message: 'Edit' }),
    outpaint: t({ id: 'mobile.library.mode.outpaint', message: 'Extend' }),
    style: t({ id: 'mobile.library.mode.style', message: 'Style transfer' }),
    text2img: t({ id: 'mobile.library.mode.text2img', message: 'Text creation' }),
    upscale: t({ id: 'mobile.library.mode.upscale', message: 'Upscale' }),
  };

  return (
    <ScrollView
      contentContainerStyle={{ alignItems: 'center', gap: 18, padding: 20 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={{ alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Pressable
          accessibilityLabel={t({ id: 'mobile.library.back', message: 'Back to library' })}
          accessibilityRole="button"
          onPress={onClose}
          style={{ alignItems: 'center', flexDirection: 'row', gap: 6, paddingVertical: 6 }}
          testID="close-wallpaper-detail"
        >
          <AppIcon color={theme.text} name="arrow-left" />
          <ThemedText variant="body">
            {t({ id: 'mobile.tab.library', message: 'Library' })}
          </ThemedText>
        </Pressable>
        <ThemedText style={{ color: theme.mutedText }} variant="caption">
          {modeLabels[wallpaper.mode] ??
            t({ id: 'mobile.library.generated', message: 'Generated' })}
        </ThemedText>
      </View>

      {wallpaper.resultImageUrl ? (
        <WallpaperPreview
          height={previewHeight}
          image={{ uri: wallpaper.resultImageUrl }}
          mode={previewMode}
          width={previewWidth}
        />
      ) : (
        <View
          style={{
            alignItems: 'center',
            backgroundColor: theme.card,
            borderRadius: 18,
            height: previewHeight,
            justifyContent: 'center',
            width: previewWidth,
          }}
        >
          <ThemedText variant="body">
            {t({
              id: 'mobile.library.noPreview',
              message: 'This wallpaper has no preview image.',
            })}
          </ThemedText>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(
          [
            ['lock-screen', t({ id: 'mobile.preview.lockScreen', message: 'Lock screen' })],
            ['home-screen', t({ id: 'mobile.preview.homeScreen', message: 'Home screen' })],
          ] as const
        ).map(([mode, label]) => {
          const selected = mode === previewMode;
          return (
            <Pressable
              key={mode}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onModeChange(mode)}
              style={{
                backgroundColor: selected ? theme.accent : theme.surface,
                borderColor: selected ? theme.accent : theme.border,
                borderCurve: 'continuous',
                borderRadius: 9,
                borderWidth: 1,
                paddingHorizontal: 16,
                paddingVertical: 9,
              }}
              testID={`detail-preview-mode-${mode}`}
            >
              <ThemedText
                style={{ color: selected ? theme.accentForeground : theme.text }}
                variant="caption"
              >
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {actionSlot ?? (
        <View style={{ alignItems: 'center', gap: 4 }} testID="apply-sheet-placeholder">
          <ThemedText variant="body">
            {t({ id: 'mobile.library.actionsPending', message: 'Apply and share coming soon' })}
          </ThemedText>
          <ThemedText style={{ color: theme.mutedText, textAlign: 'center' }} variant="caption">
            {t({
              id: 'mobile.library.actionsPending.description',
              message: 'Choose lock screen, home screen, and sharing actions when available.',
            })}
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}
