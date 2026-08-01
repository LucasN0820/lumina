import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { TextInput, View } from 'react-native';

import { ErrorState, LoadingState } from '@/components/feedback';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { ResultView } from '@/features/create/result-view';
import { useGenerate } from '@/hooks/use-generate';
import { useTheme } from '@/hooks/use-theme';
import { useCreateStore } from '@/stores/create-store';
import type { WallpaperSize } from '@/lib/useDeviceSize';

import { EditModePicker, type ExistingImageMode } from './EditModePicker';
import { ImagePickerEntry } from './ImagePickerEntry';
import { StyleToPresetForm } from './StyleToPresetForm';

type ExistingImageEditorProps = {
  deviceSize: WallpaperSize;
};

export function ExistingImageEditor({ deviceSize }: ExistingImageEditorProps) {
  const instruction = useCreateStore((state) => state.instruction);
  const mode = useCreateStore((state) => state.mode);
  const sourceImageUrl = useCreateStore((state) => state.sourceImageUrl);
  const setInstruction = useCreateStore((state) => state.setInstruction);
  const setMode = useCreateStore((state) => state.setMode);
  const setSourceImageUrl = useCreateStore((state) => state.setSourceImageUrl);
  const generation = useGenerate('edit');
  const queryClient = useQueryClient();
  const theme = useTheme();
  const hasResult =
    generation.job?.status === 'succeeded' && Boolean(generation.job.resultImageUrl);
  const isStyleComplete = hasResult && mode === 'style';

  useEffect(() => {
    if (isStyleComplete) {
      void queryClient.invalidateQueries({ queryKey: ['presets'] });
    }
  }, [isStyleComplete, queryClient]);

  function run(modeToRun: ExistingImageMode, requestedInstruction?: string) {
    if (!sourceImageUrl) {
      return;
    }
    const defaultInstruction =
      modeToRun === 'outpaint'
        ? 'Extend the image to fit my screen naturally.'
        : modeToRun === 'upscale'
          ? 'Improve the image quality and preserve all visual details.'
          : modeToRun === 'style'
            ? 'Extract a reusable wallpaper style from this image.'
            : instruction;
    generation.generate({
      height: deviceSize.targetHeight,
      mode: modeToRun,
      quality: 'hd',
      sourceImageUrl,
      userInputs: {
        idea: requestedInstruction ?? defaultInstruction,
      },
      width: deviceSize.targetWidth,
    });
  }

  if (hasResult && generation.job) {
    if (isStyleComplete) {
      return (
        <ThemedView variant="card" style={{ gap: 10 }}>
          <ThemedText variant="subtitle">自定义预设已保存</ThemedText>
          <ThemedText style={{ color: theme.mutedText }} variant="body">
            现在可以在上方创作区的预设列表中选择它，再次生成壁纸。
          </ThemedText>
          <Button
            icon="refresh"
            label="再提取一种风格"
            onPress={generation.regenerate}
            variant="secondary"
          />
        </ThemedView>
      );
    }
    return <ResultView job={generation.job} onRegenerate={generation.regenerate} />;
  }

  return (
    <ThemedView variant="card" style={{ gap: 16 }}>
      <ImagePickerEntry onUploaded={setSourceImageUrl} sourceImageUrl={sourceImageUrl} />
      {sourceImageUrl ? <EditModePicker onSelect={setMode} selectedMode={mode} /> : null}
      {mode === 'edit' ? (
        <View style={{ gap: 10 }}>
          <ThemedText variant="subtitle">如何修改？</ThemedText>
          <TextInput
            multiline
            onChangeText={setInstruction}
            placeholder="例如：把天空改成日落，保留建筑和人物"
            placeholderTextColor={theme.mutedText}
            style={{
              borderColor: theme.border,
              borderCurve: 'continuous',
              borderRadius: 11,
              borderWidth: 1,
              color: theme.text,
              minHeight: 80,
              padding: 12,
            }}
            value={instruction}
          />
          <ActionButton
            disabled={!instruction.trim() || generation.isGenerating}
            label="开始编辑"
            onPress={() => run('edit')}
          />
        </View>
      ) : null}
      {mode === 'style' ? (
        <StyleToPresetForm
          instruction={instruction}
          isSubmitting={generation.isGenerating}
          onChangeInstruction={setInstruction}
          onSubmit={(value) => run('style', value)}
        />
      ) : null}
      {mode === 'outpaint' || mode === 'upscale' ? (
        <ActionButton
          disabled={generation.isGenerating}
          label={mode === 'outpaint' ? '扩展到屏幕比例' : '优化为高清壁纸'}
          onPress={() => run(mode)}
        />
      ) : null}
      {generation.isGenerating ? <LoadingState label="正在处理图片，请稍候…" /> : null}
      {generation.error ? (
        <ErrorState message={generation.error.message} onRetry={generation.retry} />
      ) : null}
    </ThemedView>
  );
}

function ActionButton({
  disabled,
  label,
  onPress,
}: {
  disabled: boolean;
  label: string;
  onPress: () => void;
}) {
  return <Button disabled={disabled} label={label} onPress={onPress} />;
}
