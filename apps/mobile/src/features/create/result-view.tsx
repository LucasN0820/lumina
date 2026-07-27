import { useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';

import { WallpaperPreview, type WallpaperPreviewMode } from '@/components/WallpaperPreview';
import { ThemedText } from '@/components/themed-text';
import { ApplySheet } from '@/features/apply/ApplySheet';
import { useTheme } from '@/hooks/use-theme';
import type { GenerationJob } from '@/lib/api';

type ResultViewProps = {
  job: GenerationJob;
  onRegenerate: () => void;
};

export function ResultView({ job, onRegenerate }: ResultViewProps) {
  const [mode, setMode] = useState<WallpaperPreviewMode>('lock-screen');
  const [isApplySheetVisible, setIsApplySheetVisible] = useState(false);
  const { width: windowWidth } = useWindowDimensions();
  const theme = useTheme();

  if (!job.resultImageUrl) {
    return null;
  }

  const previewWidth = Math.max(160, Math.min(windowWidth - 48, 280));
  const previewHeight = Math.round(previewWidth * ((job.height ?? 2) / (job.width ?? 1)));

  return (
    <View style={{ alignItems: 'center', gap: 16 }}>
      <ThemedText variant="title">你的壁纸已生成</ThemedText>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(
          [
            ['lock-screen', '锁屏'],
            ['home-screen', '桌面'],
          ] as const
        ).map(([nextMode, label]) => {
          const selected = mode === nextMode;

          return (
            <Pressable
              key={nextMode}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setMode(nextMode)}
              style={{
                backgroundColor: selected ? theme.accent : theme.surface,
                borderColor: selected ? theme.accent : theme.border,
                borderCurve: 'continuous',
                borderRadius: 999,
                borderWidth: 1,
                paddingHorizontal: 16,
                paddingVertical: 9,
              }}
              testID={`preview-mode-${nextMode}`}
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
      <WallpaperPreview
        height={previewHeight}
        image={{ uri: job.resultImageUrl }}
        mode={mode}
        width={previewWidth}
      />
      <Pressable accessibilityRole="button" onPress={onRegenerate} testID="regenerate-button">
        <ThemedText style={{ color: theme.accent }} variant="body">
          重新生成
        </ThemedText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => setIsApplySheetVisible(true)}
        style={{
          backgroundColor: theme.accent,
          borderCurve: 'continuous',
          borderRadius: 14,
          paddingHorizontal: 20,
          paddingVertical: 12,
        }}
        testID="open-apply-sheet"
      >
        <ThemedText style={{ color: theme.surface }} variant="body">
          应用、保存或分享
        </ThemedText>
      </Pressable>
      <ApplySheet
        imageUrl={job.resultImageUrl}
        onDismiss={() => setIsApplySheetVisible(false)}
        visible={isApplySheetVisible}
      />
    </View>
  );
}
