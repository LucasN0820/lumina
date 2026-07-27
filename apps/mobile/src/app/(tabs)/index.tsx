import { useState } from 'react';
import { ScrollView } from 'react-native';

import {
  ChipsSelector,
  type CreateChipField,
  type CreateChipValues,
} from '@/features/create/chips-selector';
import { GenerateButton } from '@/features/create/generate-button';
import { IdeaInput } from '@/features/create/idea-input';
import { PresetGrid } from '@/features/create/preset-grid';
import { ResultView } from '@/features/create/result-view';
import { ErrorState, LoadingState } from '@/components/feedback';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGenerate } from '@/hooks/use-generate';
import { useDeviceSize } from '@/lib/useDeviceSize';

export default function CreateTab() {
  const deviceSize = useDeviceSize();
  const [idea, setIdea] = useState('');
  const [presetId, setPresetId] = useState<string>();
  const [chipValues, setChipValues] = useState<CreateChipValues>({});
  const generation = useGenerate();
  const trimmedIdea = idea.trim();
  const generationSucceeded =
    generation.job?.status === 'succeeded' && Boolean(generation.job.resultImageUrl);

  function updateChip(field: CreateChipField, value: string | undefined) {
    setChipValues((current) => ({ ...current, [field]: value }));
  }

  function generateWallpaper() {
    generation.generate({
      height: deviceSize.targetHeight,
      mode: 'text2img',
      presetId,
      userInputs: { idea: trimmedIdea, ...chipValues },
      width: deviceSize.targetWidth,
    });
  }

  return (
    <ScrollView
      contentContainerStyle={{ gap: 16, padding: 24 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      {generationSucceeded && generation.job ? (
        <ResultView job={generation.job} onRegenerate={generation.regenerate} />
      ) : (
        <>
          <ThemedView variant="card" style={{ gap: 8 }}>
            <ThemedText variant="title">开始创作</ThemedText>
            <ThemedText variant="body">选择预设，补充灵感，生成一张适合你屏幕的壁纸。</ThemedText>
          </ThemedView>

          <ThemedView variant="card" style={{ gap: 16 }}>
            <PresetGrid onSelect={setPresetId} selectedPresetId={presetId} />
            <ChipsSelector onChange={updateChip} values={chipValues} />
            <IdeaInput onChangeText={setIdea} value={idea} />
            {generation.isGenerating ? <LoadingState label="正在生成壁纸，请稍候…" /> : null}
            {generation.error ? (
              <ErrorState message={generation.error.message} onRetry={generation.retry} />
            ) : null}
            <GenerateButton
              disabled={!trimmedIdea || generation.isGenerating}
              isGenerating={generation.isGenerating}
              onPress={generateWallpaper}
            />
          </ThemedView>

          <ThemedView variant="card" style={{ gap: 8 }}>
            <ThemedText variant="subtitle">推荐出图尺寸</ThemedText>
            <ThemedText variant="body">
              {deviceSize.targetWidth} × {deviceSize.targetHeight}
            </ThemedText>
            <ThemedText variant="caption">
              当前屏幕像素：{deviceSize.pixelWidth} × {deviceSize.pixelHeight}
            </ThemedText>
          </ThemedView>
        </>
      )}
    </ScrollView>
  );
}
