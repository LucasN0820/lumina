import { generateWallpaperKey } from '../../lib/r2.js';
import { ImageProviderError } from '../../providers/types.js';
import type { WallpaperGraphState } from '../state.js';
import type { WallpaperGraphDependencies } from './types.js';

export function createWallpaperNodes(dependencies: WallpaperGraphDependencies) {
  return {
    resolvePreset: async (state: WallpaperGraphState) => {
      validateDimensions(state);
      const preset = state.presetId ? await dependencies.presets.findById(state.presetId) : null;

      if (state.presetId && !preset) {
        throw new Error(`Preset ${state.presetId} was not found.`);
      }

      const prompt = resolvePrompt(preset?.promptTemplate, state);
      let wallpaperId = state.wallpaperId;
      if (wallpaperId) {
        await dependencies.wallpapers.update(wallpaperId, { prompt, status: 'processing' });
      } else {
        const wallpaper = await dependencies.wallpapers.create({
          deviceId: state.deviceId,
          height: state.height,
          mode: state.mode,
          presetId: state.presetId,
          prompt,
          sourceImageUrl: state.sourceImageUrl,
          status: 'pending',
          userId: state.userId,
          width: state.width,
        });

        wallpaperId = wallpaper.id;
        dependencies.onWallpaperCreated?.(wallpaper.id);
      }

      return {
        negativePrompt: preset?.negativePrompt ?? undefined,
        prompt,
        styleRefUrl: preset?.styleRefUrl ?? undefined,
        wallpaperId,
      };
    },
    enrichPrompt: async (state: WallpaperGraphState) => {
      if (!dependencies.enrichPrompt) {
        return {};
      }

      return { prompt: await dependencies.enrichPrompt(state) };
    },
    generate: async (state: WallpaperGraphState) => ({
      providerResult: await dependencies.imageProvider.textToImage(toImageSpec(state)),
    }),
    edit: async (state: WallpaperGraphState) => ({
      providerResult: await dependencies.imageProvider.editImage(toImageSpec(state)),
    }),
    outpaint: async (state: WallpaperGraphState) => ({
      providerResult: await dependencies.imageProvider.outpaint(toImageSpec(state)),
    }),
    style: async (state: WallpaperGraphState) => ({
      providerResult: await dependencies.imageProvider.extractStyle(toImageSpec(state)),
    }),
    upscale: async (state: WallpaperGraphState) => ({
      providerResult: await dependencies.imageProvider.upscale(toImageSpec(state)),
    }),
    persist: async (state: WallpaperGraphState) => {
      // TODO: moderation / watermark / policy checks
      if (!state.wallpaperId || !state.providerResult || !state.prompt) {
        throw new Error(
          'A generated wallpaper and provider result are required before persistence.',
        );
      }

      const result = state.providerResult;
      const mimeType = getMimeType(result.metadata?.mimeType);
      const key = generateWallpaperKey({
        extension: extensionForMimeType(mimeType),
        id: state.wallpaperId,
      });
      const stored = result.imageBytes
        ? await dependencies.storage.uploadBuffer(Buffer.from(result.imageBytes), key, mimeType)
        : result.imagePath
          ? await dependencies.storage.uploadFile(result.imagePath, key, mimeType)
          : result.imageUrl
            ? await dependencies.storage.uploadFromUrl(result.imageUrl, key, mimeType)
            : undefined;

      if (!stored) {
        throw new ImageProviderError(
          'INVALID_ARTIFACT',
          'The image provider returned no persistable artifact.',
        );
      }

      await dependencies.wallpapers.update(state.wallpaperId, {
        error: null,
        providerTask: result.providerTask,
        prompt: state.prompt,
        resultImageUrl: stored.url,
        status: 'succeeded',
        width: result.width ?? state.width,
        height: result.height ?? state.height,
      });

      return { resultImageUrl: stored.url };
    },
  };
}

function resolvePrompt(template: string | undefined, state: WallpaperGraphState): string {
  const values: Record<string, string> = {
    ...Object.fromEntries(
      Object.entries(state.userInputs).map(([key, value]) => [key, value.trim() || '']),
    ),
    height: String(state.height),
    width: String(state.width),
  };
  const fallback = [
    state.userInputs.idea,
    state.userInputs.theme,
    state.userInputs.mood,
    state.userInputs.tone,
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(', ');
  const prompt = (template ?? fallback).replace(
    /{{\s*([\w-]+)\s*}}/g,
    (_, key: string) => values[key] ?? '',
  );

  if (!prompt.trim()) {
    throw new Error('Provide a preset or at least one wallpaper idea, theme, or mood.');
  }

  return prompt.replace(/\s{2,}/g, ' ').trim();
}

function toImageSpec(state: WallpaperGraphState) {
  if (!state.prompt) {
    throw new Error('The resolved wallpaper prompt is missing.');
  }

  return {
    height: state.height,
    mode: state.mode,
    negativePrompt: state.negativePrompt,
    prompt: state.prompt,
    sourceImageUrl: state.sourceImageUrl,
    styleRefUrl: state.styleRefUrl,
    width: state.width,
  };
}

function validateDimensions(state: WallpaperGraphState): void {
  for (const [name, value] of Object.entries({ height: state.height, width: state.width })) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new TypeError(`${name} must be a positive integer.`);
    }
  }
}

function getMimeType(value: unknown): string {
  return typeof value === 'string' && value.startsWith('image/') ? value : 'image/png';
}

function extensionForMimeType(mimeType: string): string {
  return (
    {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/svg+xml': 'svg',
      'image/webp': 'webp',
    }[mimeType] ?? 'png'
  );
}
