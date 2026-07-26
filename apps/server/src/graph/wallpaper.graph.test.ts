import { describe, expect, it } from 'vite-plus/test';

import type { Wallpaper } from '../../prisma/generated/prisma/client.js';
import type { ImageProvider, ImageResult, ImageSpec } from '../providers/types.js';
import { runWallpaperGraph } from './wallpaper.graph.js';
import type { WallpaperGraphDependencies } from './nodes/types.js';

describe('runWallpaperGraph', () => {
  it('runs text-to-image through prompt enrichment and R2 persistence', async () => {
    const harness = createHarness();

    const wallpaper = await runWallpaperGraph(
      {
        height: 2400,
        mode: 'text2img',
        presetId: 'preset-minimal',
        userInputs: { idea: 'a calm night sky', mood: 'calm' },
        width: 1080,
      },
      {
        ...harness.dependencies,
        enrichPrompt: async (state) => `professional: ${state.prompt}`,
      },
    );

    expect(harness.calls).toEqual(['textToImage']);
    expect(harness.uploads).toHaveLength(1);
    expect(harness.uploads[0]).toMatchObject({ contentType: 'image/png' });
    expect(harness.uploads[0]?.key).toMatch(/^wallpapers\/\d{6}\/wallpaper-1\.png$/);
    expect(wallpaper.status).toBe('succeeded');
    expect(wallpaper.resultImageUrl).toBe('https://r2.example/wallpaper-1.png');
    expect(wallpaper.prompt).toContain('professional:');
  });

  it('routes outpaint to its provider operation and persists its artifact', async () => {
    const harness = createHarness();

    await runWallpaperGraph(
      {
        height: 2400,
        mode: 'outpaint',
        sourceImageUrl: 'https://source.example/image.png',
        userInputs: { theme: 'ocean' },
        width: 1080,
      },
      harness.dependencies,
    );

    expect(harness.calls).toEqual(['outpaint']);
    expect(harness.wallpaper.status).toBe('succeeded');
  });

  it('generates from a tone-only input without a preset', async () => {
    const harness = createHarness();

    const wallpaper = await runWallpaperGraph(
      {
        height: 2400,
        mode: 'text2img',
        userInputs: { tone: 'warm' },
        width: 1080,
      },
      harness.dependencies,
    );

    expect(wallpaper.prompt).toBe('warm');
    expect(wallpaper.status).toBe('succeeded');
  });

  it('marks the created wallpaper as failed when a provider node throws', async () => {
    const harness = createHarness({ providerError: new Error('provider quota exhausted') });

    await expect(
      runWallpaperGraph(
        {
          height: 2400,
          mode: 'text2img',
          userInputs: { idea: 'a calm night sky' },
          width: 1080,
        },
        harness.dependencies,
      ),
    ).rejects.toThrow('provider quota exhausted');

    expect(harness.wallpaper.status).toBe('failed');
    expect(harness.wallpaper.error).toBe('provider quota exhausted');
  });

  it('uses an existing job record and marks that job as failed when generation throws', async () => {
    const harness = createHarness({ providerError: new Error('provider quota exhausted') });

    await expect(
      runWallpaperGraph(
        {
          height: 2400,
          mode: 'text2img',
          userInputs: { idea: 'a calm night sky' },
          wallpaperId: 'wallpaper-1',
          width: 1080,
        },
        harness.dependencies,
      ),
    ).rejects.toThrow('provider quota exhausted');

    expect(harness.createCalls()).toBe(0);
    expect(harness.wallpaper.status).toBe('failed');
    expect(harness.wallpaper.error).toBe('provider quota exhausted');
  });
});

function createHarness(options: { providerError?: Error } = {}) {
  const calls: string[] = [];
  let createCalls = 0;
  const uploads: { contentType: string; key: string }[] = [];
  const wallpaper = {
    createdAt: new Date(),
    error: null,
    height: null,
    id: 'wallpaper-1',
    mode: 'text2img',
    presetId: null,
    prompt: '',
    providerTask: null,
    resultImageUrl: null,
    sourceImageUrl: null,
    status: 'pending',
    updatedAt: new Date(),
    userId: null,
  } as Wallpaper;
  const provider = createProvider(calls, options.providerError);

  const dependencies: WallpaperGraphDependencies = {
    imageProvider: provider,
    presets: {
      async findById(id) {
        return id === 'preset-minimal'
          ? {
              id,
              negativePrompt: 'watermark',
              promptTemplate: 'A minimal {{idea}} in a {{mood}} composition, {{width}}x{{height}}.',
              styleRefUrl: null,
            }
          : null;
      },
    },
    storage: {
      async uploadBuffer(_buffer, key, contentType) {
        uploads.push({ contentType, key });
        return { key, url: `https://r2.example/${key.split('/').at(-1)}` };
      },
      async uploadFile() {
        throw new Error('unexpected uploadFile call');
      },
      async uploadFromUrl() {
        throw new Error('unexpected uploadFromUrl call');
      },
    },
    wallpapers: {
      async create(data) {
        createCalls += 1;
        Object.assign(wallpaper, data);
        return wallpaper;
      },
      async update(_id, data) {
        Object.assign(wallpaper, data);
        return wallpaper;
      },
    },
  };

  return { calls, createCalls: () => createCalls, dependencies, uploads, wallpaper };
}

function createProvider(calls: string[], providerError?: Error): ImageProvider {
  const result = (): ImageResult => {
    if (providerError) {
      throw providerError;
    }

    return {
      imageBytes: new Uint8Array([1, 2, 3]),
      metadata: { mimeType: 'image/png' },
      providerTask: 'mock-task',
      width: 1080,
      height: 2400,
    };
  };
  const invoke = (operation: string) => async (_spec: ImageSpec) => {
    calls.push(operation);
    return result();
  };

  return {
    editImage: invoke('edit'),
    extractStyle: invoke('style'),
    outpaint: invoke('outpaint'),
    textToImage: invoke('textToImage'),
    upscale: invoke('upscale'),
  };
}
