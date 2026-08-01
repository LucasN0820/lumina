import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';

import { WallpaperPreview, type WallpaperPreviewMode } from '@/components/WallpaperPreview';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ApplySheet } from '@/features/apply/ApplySheet';
import { useTheme } from '@/hooks/use-theme';
import type { GenerationJob } from '@/lib/api';

type ResultViewProps = {
  job: GenerationJob;
  onRegenerate: () => void;
};

export function ResultView({ job, onRegenerate }: ResultViewProps) {
  const { t } = useLingui();
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
    <View style={{ alignItems: 'center', gap: 18 }}>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <ThemedText variant="title">
          {t({ id: 'mobile.create.result.ready', message: 'Your wallpaper is ready' })}
        </ThemedText>
        <ThemedText selectable style={{ color: theme.mutedText }} variant="caption">
          {job.quality === 'draft'
            ? t({
                id: 'mobile.create.result.draft',
                message: 'Quick preview · Low resolution',
              })
            : t({
                id: 'mobile.create.result.hd',
                message: 'High resolution · Full 2K+',
              })}
        </ThemedText>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(
          [
            ['lock-screen', t({ id: 'mobile.preview.lockScreen', message: 'Lock screen' })],
            ['home-screen', t({ id: 'mobile.preview.homeScreen', message: 'Home screen' })],
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
                borderRadius: 9,
                borderWidth: 1,
                paddingHorizontal: 16,
                paddingVertical: 9,
              }}
              testID={`preview-mode-${nextMode}`}
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
      <WallpaperPreview
        height={previewHeight}
        image={{ uri: job.resultImageUrl }}
        mode={mode}
        width={previewWidth}
      />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button
          icon="refresh"
          label={t({ id: 'mobile.create.regenerate', message: 'Regenerate' })}
          onPress={onRegenerate}
          testID="regenerate-button"
          variant="secondary"
        />
        <Button
          icon="download"
          label={t({ id: 'mobile.create.applyAndSave', message: 'Apply and save' })}
          onPress={() => setIsApplySheetVisible(true)}
          testID="open-apply-sheet"
        />
      </View>
      <ApplySheet
        imageUrl={job.resultImageUrl}
        onDismiss={() => setIsApplySheetVisible(false)}
        visible={isApplySheetVisible}
      />
    </View>
  );
}
