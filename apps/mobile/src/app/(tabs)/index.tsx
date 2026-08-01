import { ScrollView } from 'react-native';

import { ChipsSelector, type CreateChipField } from '@/features/create/chips-selector';
import { GenerateButton } from '@/features/create/generate-button';
import { IdeaInput } from '@/features/create/idea-input';
import { PresetGrid } from '@/features/create/preset-grid';
import { QualitySelector } from '@/features/create/quality-selector';
import { ResultView } from '@/features/create/result-view';
import { ExistingImageEditor } from '@/features/edit/ExistingImageEditor';
import { ErrorState, LoadingState } from '@/components/feedback';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SectionHeading } from '@/components/ui/section-heading';
import { useGenerate } from '@/hooks/use-generate';
import { useDeviceSize } from '@/lib/useDeviceSize';
import { useCreateStore } from '@/stores/create-store';

export default function CreateTab() {
  const deviceSize = useDeviceSize();
  const idea = useCreateStore((state) => state.idea);
  const presetId = useCreateStore((state) => state.presetId);
  const chipValues = useCreateStore((state) => state.chipValues);
  const quality = useCreateStore((state) => state.quality);
  const setIdea = useCreateStore((state) => state.setIdea);
  const setPresetId = useCreateStore((state) => state.setPresetId);
  const setChip = useCreateStore((state) => state.setChip);
  const setQuality = useCreateStore((state) => state.setQuality);
  const generation = useGenerate();
  const trimmedIdea = idea.trim();
  const generationSucceeded =
    generation.job?.status === 'succeeded' && Boolean(generation.job.resultImageUrl);

  function updateChip(field: CreateChipField, value: string | undefined) {
    setChip(field, value);
  }

  function generateWallpaper() {
    generation.generate({
      height: deviceSize.targetHeight,
      mode: 'text2img',
      presetId,
      quality,
      userInputs: { idea: trimmedIdea, ...chipValues },
      width: deviceSize.targetWidth,
    });
  }

  return (
    <ScrollView
      contentContainerStyle={{ gap: 18, paddingHorizontal: 20, paddingVertical: 24 }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      {generationSucceeded && generation.job ? (
        <ResultView job={generation.job} onRegenerate={generation.regenerate} />
      ) : (
        <>
          <SectionHeading
            description="选择视觉方向，写下此刻的灵感。其余交给 Lumina。"
            eyebrow="Lumina studio"
            title="把一个念头，变成你的壁纸"
          />

          <ThemedView variant="card" style={{ gap: 20 }}>
            <PresetGrid onSelect={setPresetId} selectedPresetId={presetId} />
            <ChipsSelector onChange={updateChip} values={chipValues} />
            <IdeaInput onChangeText={setIdea} value={idea} />
            <QualitySelector onChange={setQuality} value={quality} />
            {generation.isGenerating ? <LoadingState label="正在生成壁纸，请稍候…" /> : null}
            {generation.cooldownSeconds > 0 && !generation.isGenerating ? (
              <ThemedText selectable variant="caption">
                为避免重复请求，请在 {generation.cooldownSeconds} 秒后再次出图。
              </ThemedText>
            ) : null}
            {generation.error ? (
              <ErrorState message={generation.error.message} onRetry={generation.retry} />
            ) : null}
            <GenerateButton
              disabled={!trimmedIdea || generation.isGenerating || generation.cooldownSeconds > 0}
              isGenerating={generation.isGenerating}
              onPress={generateWallpaper}
            />
          </ThemedView>

          <ExistingImageEditor deviceSize={deviceSize} />

          <ThemedView
            variant="card"
            style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <ThemedText variant="caption">为此设备优化</ThemedText>
            <ThemedText style={{ fontVariant: ['tabular-nums'] }} variant="label">
              {deviceSize.targetWidth} × {deviceSize.targetHeight}
            </ThemedText>
          </ThemedView>
        </>
      )}
    </ScrollView>
  );
}
