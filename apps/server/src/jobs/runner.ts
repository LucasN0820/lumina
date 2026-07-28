import { runWallpaperGraph, type WallpaperGraphInput } from '../graph/wallpaper.graph.js';
import { ImageProviderError } from '../providers/types.js';

export type GenerationRunner = {
  run(input: WallpaperGraphInput): Promise<void>;
};

export type GenerationRunnerOptions = {
  maxAttempts?: number;
  sleep?: (milliseconds: number) => Promise<void>;
};

export function createGenerationRunner(
  runGraph: (input: WallpaperGraphInput) => Promise<unknown> = runWallpaperGraph,
  { maxAttempts = 3, sleep = delay }: GenerationRunnerOptions = {},
): GenerationRunner {
  return {
    async run(input) {
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          await runGraph(input);
          return;
        } catch (error) {
          if (attempt === maxAttempts || !isRetryableProviderError(error)) {
            throw error;
          }

          await sleep(250 * 2 ** (attempt - 1));
        }
      }
    },
  };
}

export const generationRunner = createGenerationRunner();

function isRetryableProviderError(error: unknown): boolean {
  return (
    error instanceof ImageProviderError &&
    ['PROVIDER_UNAVAILABLE', 'RATE_LIMITED', 'TIMEOUT'].includes(error.code)
  );
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
