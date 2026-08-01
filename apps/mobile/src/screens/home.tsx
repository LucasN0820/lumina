import { useLingui } from '@lingui/react/macro';
import { ScrollView } from 'react-native';

import { ErrorState, LoadingState } from '@/components/feedback';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ChipsSelector, type CreateChipField } from '@/features/create/chips-selector';
import { GenerateButton } from '@/features/create/generate-button';
import { IdeaInput } from '@/features/create/idea-input';
import { PresetGrid } from '@/features/create/preset-grid';
import { QualitySelector } from '@/features/create/quality-selector';
import { ResultView } from '@/features/create/result-view';
import { ExistingImageEditor } from '@/features/edit/ExistingImageEditor';
import { useGenerate } from '@/hooks/use-generate';
import { useDeviceSize } from '@/lib/useDeviceSize';
import { useCreateStore } from '@/stores/create-store';

export function HomeScreen() {
  const { t } = useLingui();
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
          <ThemedView variant="card" style={{ gap: 20 }}>
            <PresetGrid onSelect={setPresetId} selectedPresetId={presetId} />
            <ChipsSelector onChange={updateChip} values={chipValues} />
            <IdeaInput onChangeText={setIdea} value={idea} />
            <QualitySelector onChange={setQuality} value={quality} />
            {generation.isGenerating ? (
              <LoadingState
                label={t({
                  id: 'mobile.create.generating',
                  message: 'Generating your wallpaper…',
                })}
              />
            ) : null}
            {generation.cooldownSeconds > 0 && !generation.isGenerating ? (
              <ThemedText selectable variant="caption">
                {t({
                  id: 'mobile.create.cooldown',
                  message: `To avoid duplicate requests, try again in ${generation.cooldownSeconds} seconds.`,
                })}
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
            <ThemedText variant="caption">
              {t({ id: 'mobile.create.optimizedForDevice', message: 'Optimized for this device' })}
            </ThemedText>
            <ThemedText style={{ fontVariant: ['tabular-nums'] }} variant="label">
              {deviceSize.targetWidth} × {deviceSize.targetHeight}
            </ThemedText>
          </ThemedView>
        </>
      )}
    </ScrollView>
  );
}
