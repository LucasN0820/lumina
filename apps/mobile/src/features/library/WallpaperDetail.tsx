import type { ReactNode } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';

import { WallpaperPreview, type WallpaperPreviewMode } from '@/components/WallpaperPreview';
import { ThemedText } from '@/components/themed-text';
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
  const { width: windowWidth } = useWindowDimensions();
  const theme = useTheme();
  const previewWidth = Math.max(180, Math.min(windowWidth - 48, 320));
  const ratio = wallpaper.width && wallpaper.height ? wallpaper.height / wallpaper.width : 16 / 9;
  const previewHeight = Math.round(previewWidth * ratio);

  return (
    <ScrollView
      contentContainerStyle={{ alignItems: 'center', gap: 16, padding: 24 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={{ alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Pressable accessibilityRole="button" onPress={onClose} testID="close-wallpaper-detail">
          <ThemedText style={{ color: theme.accent }} variant="body">
            返回壁纸库
          </ThemedText>
        </Pressable>
        <ThemedText style={{ color: theme.mutedText }} variant="caption">
          {formatMode(wallpaper.mode)}
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
          <ThemedText variant="body">此壁纸没有可预览的图像。</ThemedText>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(
          [
            ['lock-screen', '锁屏'],
            ['home-screen', '桌面'],
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
                borderRadius: 999,
                borderWidth: 1,
                paddingHorizontal: 16,
                paddingVertical: 9,
              }}
              testID={`detail-preview-mode-${mode}`}
            >
              <ThemedText
                style={{ color: selected ? theme.surface : theme.text }}
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
          <ThemedText variant="body">应用与分享功能准备中</ThemedText>
          <ThemedText style={{ color: theme.mutedText, textAlign: 'center' }} variant="caption">
            设备应用模块就绪后，可在这里选择锁屏、桌面和分享操作。
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}

function formatMode(mode: string): string {
  const labels: Record<string, string> = {
    edit: '编辑',
    outpaint: '扩图',
    style: '风格迁移',
    text2img: '文字创作',
    upscale: '超分辨率',
  };
  return labels[mode] ?? '已生成';
}
